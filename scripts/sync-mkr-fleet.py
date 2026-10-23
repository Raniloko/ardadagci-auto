#!/usr/bin/env python3
"""Sync the Dubai fleet from mkrentacar.com (Masterkey Rent A Car, partner supplier).

Source of truth is the MKR overview https://mkrentacar.com/cars/ (all pages). For every car listed
there the script reads its detail page and writes:
  public/cars/<slug>/NN.webp (+ NN-sm.webp) – every photo of the car (overview cover + full gallery),
                                              downloaded and optimised for the web
  src/lib/mkr-fleet.json                    – vehicle identities, specs, MKR base price (AED), photos
  src/lib/mkr-descriptions.json             – the car's own description + FAQs (never borrowed from
                                              another listing; loaded per detail page)
  scripts/mkr-image-sources.json            – original MKR URL of every downloaded photo
Obvious errors in MKR's spec tables are corrected via scripts/spec-fixes.json. German descriptions
are maintained by hand in src/lib/car-descriptions-de.json (key = MKR car title).

The MKR base price is the partner price that must be paid to MKR. The customer price shown on
the ARDADAGCI website is calculated at runtime in `src/lib/pricing.ts`.

Prices inside descriptions are stored as `{{aed:1234}}` tokens so the site can render them with
the ARDADAGCI price instead of leaking the partner price. Supplier branding is replaced with
ARDADAGCI.

Usage:  pip install beautifulsoup4 pillow && python3 scripts/sync-mkr-fleet.py [--cache .mkr-cache]
"""

import argparse
import hashlib
import io
import shutil
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from bs4 import BeautifulSoup
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LISTING = "https://mkrentacar.com/cars/"
PHOTO_SIZES = {"": 1400, "-sm": 640}  # file suffix → max width in px
UA = {"User-Agent": "Mozilla/5.0 (ARDADAGCI fleet sync)"}

CATEGORY_MAP = {"luxury": "Luxury", "sport": "Sports", "suv": "SUV", "exotic": "Exotic", "convertible": "Convertible", "economy": "Economy"}
BRAND_PREFIXES = [
    ("range rover", "Land Rover"), ("land rover", "Land Rover"), ("landrover", "Land Rover"),
    ("rolls royce", "Rolls-Royce"), ("mclaren", "McLaren"), ("mercedes", "Mercedes"), ("g63", "Mercedes"),
    ("brabus", "Mercedes"), ("mini", "Mini"), ("ram", "Ram"), ("bmw", "BMW"), ("gmc", "GMC"),
]
SUPPLIER_NAMES = re.compile(r"\b(?:Masterkey|Master Key|MK)\s+Rent\s*(?:a|A)\s*Car\b|\bMasterkey\b|\bmkrentacar(?:\.com)?\b|\bMK rental\b", re.I)


def fetch(url, cache):
    name = re.sub(r"[^a-z0-9]+", "_", url.lower()).strip("_") + ".html"
    path = os.path.join(cache, name) if cache else None
    if path and os.path.exists(path):
        return open(path, encoding="utf-8", errors="ignore").read()
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as res:
        body = res.read().decode("utf-8", errors="ignore")
    if path:
        open(path, "w", encoding="utf-8").write(body)
    return body


def clean(text):
    text = re.sub(r"\s+", " ", html.unescape(text or "")).strip()
    return re.sub(r"\s+([,.!?;:])", r"\1", text)


def tokenise_prices(text):
    """Replace AED amounts with {{aed:N}} tokens (customer prices are calculated by the site)."""
    num = r"(\d{1,3}(?:[,.]\d{3})+|\d{1,3} \d{1,3}(?=\s*AED)|\d+)"
    to_int = lambda s: int(re.sub(r"\D", "", s))
    text = re.sub(r"\bAED\s*" + num, lambda m: "{{aed:%d}}" % to_int(m.group(1)), text)
    text = re.sub(num + r"\s*AED\b", lambda m: "{{aed:%d}}" % to_int(m.group(1)), text)
    return text


def rebrand(text):
    return tokenise_prices(SUPPLIER_NAMES.sub("ARDADAGCI", text))


def brand_of(name):
    lowered = re.sub(r"^\d{4}\s+", "", name.lower())
    for prefix, brand in BRAND_PREFIXES:
        if lowered.startswith(prefix):
            return brand
    return lowered.split()[0].capitalize()


def model_of(name, brand):
    model = re.sub(r"^\d{4}\s+", "", name)
    for prefix in ["Rolls Royce", "Mclaren", "McLaren", "Mercedes", "MINI", "Mini", "Landrover", "Land Rover", "RAM", brand]:
        if model.lower().startswith(prefix.lower() + " "):
            return model[len(prefix) + 1:]
    return model


COLOR_WORDS = r"(?:Black|White|Gr[ae]y|Blue|Green|Red|Yellow|Orange|Purple|Silver|Beige|Brown)"
MODEL_NAMES = {  # manufacturer spelling for MKR's model names
    "Rs6": "RS 6", "RS7": "RS 7", "RS 3": "RS 3", "RSQ8": "RS Q8", "RSQ8 Performance": "RS Q8 Performance",
    "E class": "E-Klasse", "G Wagon": "G-Wagon", "A200": "A 200", "C200": "C 200", "C200 Chrome": "C 200 Chrome",
    "C300 Convertible": "C 300 Cabriolet", "S500": "S 500", "E63s": "E 63 S", "GT63S": "AMG GT 63 S",
    "Evo Spyder": "Huracán EVO Spyder", "Evo Joker Edition": "Huracán EVO Joker Edition",
    "Huracan STO": "Huracán STO", "Huracan Tecnica": "Huracán Tecnica",
    "SF 90": "SF90 Stradale", "812 SuperFast": "812 Superfast", "911 Carrera 4s": "911 Carrera 4S",
}


def display_model(model):
    """Clean model name for the website: colour lives in its own field (except editions like "Black Badge")."""
    model = re.sub(r"\s+" + COLOR_WORDS + r"$", "", model) if not model.endswith("Black Badge") else model
    return MODEL_NAMES.get(model, model)


def value(raw):
    raw = (raw or "").strip()
    return None if not raw or raw.lower() in ("yes", "no", "-") else raw


def parse(url, body):
    soup = BeautifulSoup(body, "html.parser")
    title = soup.select_one(".elementor-widget-theme-post-title h3")
    grid = soup.select_one(".car-listing-specs-grid")
    if not title or not grid:
        return None
    specs = {clean(r.select_one(".spec-label").get_text()).rstrip(":"): clean(r.select_one(".spec-value").get_text()) for r in grid.select(".spec-row")}
    images = []
    for img in soup.select(".ss3-main-slider img"):
        src = img.get("src") or img.get("data-src")
        if src and src not in images:
            images.append(src)
    price = None
    for li in soup.select(".elementor-icon-list-text"):
        text = clean(li.get_text())
        if re.fullmatch(r"(AED\s*)?\d{2,6}", text):
            price = int(re.sub(r"\D", "", text))
            break
    blocks, faqs = [], []
    content = soup.select_one(".elementor-widget-theme-post-content .elementor-widget-container")
    if content:
        for item in content.select(".faq-item"):
            q, a = item.select_one(".faq-question"), item.select_one(".faq-answer")
            if q and a:
                faqs.append({"q": rebrand(clean(q.get_text().replace("+", ""))), "a": rebrand(clean(a.get_text(" ")))})
        for acc in content.select(".faq-accordion"):
            acc.decompose()
        for el in content.find_all(["h2", "h3", "h4", "p", "li"]):
            if el.name == "p" and el.find_parent("li"):
                continue
            text = clean(el.get_text(" "))
            if text and text != "+":
                blocks.append({"t": "h" if el.name.startswith("h") else el.name, "x": rebrand(text)})
    if not images or not price:
        return None
    return {"url": url, "name": clean(title.get_text()), "price": price, "specs": specs, "images": images, "blocks": blocks, "faqs": faqs}


def listing(cache):
    """All cars on the MKR overview (every page): [(detail URL, cover image URL)]."""
    cars, page = [], 1
    while True:
        try:
            body = fetch(LISTING if page == 1 else f"{LISTING}{page}/", cache)
        except urllib.error.HTTPError:
            break
        soup = BeautifulSoup(body, "html.parser")
        found = 0
        for link in soup.find_all("a", href=True):
            if link.get_text(strip=True).lower() != "view more":
                continue
            card = link
            for _ in range(12):
                card = card.parent
                if card is None:
                    break
                imgs = [i.get("src") or i.get("data-src") for i in card.find_all("img")]
                imgs = [u for u in imgs if u and "/uploads/" in u]
                if imgs:
                    cars.append((link["href"].rstrip("/") + "/", imgs[0]))
                    found += 1
                    break
        if not found:
            break
        page += 1
    return list(dict.fromkeys(cars))


def original(url):
    """Strip WordPress size suffixes (e.g. -1024x693) to get the full-resolution upload."""
    return re.sub(r"-\d+x\d+(?=\.\w+$)", "", url)


def download(url, cache):
    name = hashlib.sha1(url.encode()).hexdigest() + os.path.splitext(url)[1]
    path = os.path.join(cache or "", "img", name)
    if cache and os.path.exists(path):
        return open(path, "rb").read()
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as res:
                data = res.read()
            break
        except urllib.error.HTTPError:
            raise
        except OSError:  # flaky connection – retry
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)
    if cache:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, "wb").write(data)
    return data


def save_photos(slug, urls, cache, out_dir):
    """Download every photo of a car and store optimised WebP files under public/cars/<slug>/."""
    photos, sources = [], {}
    folder = os.path.join(out_dir, slug)
    os.makedirs(folder, exist_ok=True)
    for full, listed in urls:
        image = None
        for url in dict.fromkeys([full, listed]):  # prefer the full-resolution upload
            try:
                image = Image.open(io.BytesIO(download(url, cache)))
                image.load()
                break
            except Exception as error:  # missing size variant or broken upload on MKR
                print(f"skip {url}: {error}", file=sys.stderr)
                image = None
        if image is None:
            continue
        image = image.convert("RGBA" if "A" in image.getbands() or "transparency" in image.info else "RGB")
        number = f"{len(photos) + 1:02d}"
        for suffix, max_width in PHOTO_SIZES.items():
            copy = image.copy()
            copy.thumbnail((max_width, max_width * 3), Image.LANCZOS)
            copy.save(os.path.join(folder, f"{number}{suffix}.webp"), "WEBP", quality=80 if not suffix else 74, method=5)
        large = image.copy()
        large.thumbnail((PHOTO_SIZES[""], PHOTO_SIZES[""] * 3))
        photos.append({"src": f"/cars/{slug}/{number}.webp", "sm": f"/cars/{slug}/{number}-sm.webp", "w": large.width, "h": large.height})
        sources[photos[-1]["src"]] = url
    return photos, sources


def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", default=None, help="directory to cache downloaded pages and photos")
    args = ap.parse_args()
    if args.cache:
        os.makedirs(args.cache, exist_ok=True)
    listed = listing(args.cache)
    with ThreadPoolExecutor(6) as pool:
        bodies = list(pool.map(lambda car: fetch(car[0], args.cache), listed))
    parsed = []
    for (url, cover), body in zip(listed, bodies):
        page = parse(url, body)
        if not page:
            print(f"skip {url}: no specs/price", file=sys.stderr)
            continue
        photos = {}
        for u in [cover, *page["images"]]:  # overview cover first, then the full gallery
            photos.setdefault(original(u), u)
        page["photos"] = list(photos.items())
        parsed.append(page)

    fixes = json.load(open(os.path.join(ROOT, "scripts", "spec-fixes.json")))
    cars, descriptions, used, jobs = [], {}, set(), []
    for p in sorted(parsed, key=lambda p: (p["name"].lower(), p["url"])):
        s = p["specs"]
        brand = brand_of(p["name"])
        cat_raw = (s.get("Car Type") or "").lower()
        category = next((v for k, v in CATEGORY_MAP.items() if k in cat_raw), "Luxury")
        color = value(s.get("Color"))
        slug = slugify(p["name"])
        if slug in used and color and slugify(color) not in slug:
            slug = slugify(f"{p['name']} {color}")
        n, base = 2, slug
        while slug in used:
            slug, n = f"{base}-{n}", n + 1
        used.add(slug)
        zero = value(s.get("0-100"))
        cars.append({
            "slug": slug, "brand": brand, "name": display_model(model_of(p["name"], brand)), "title": p["name"], "category": category,
            "baseDailyAed": p["price"], "color": color, "engine": value(s.get("Engine")), "drive": value(s.get("Drive")),
            "fuel": value(s.get("Fuel")), "transmission": value(s.get("Transmission")),
            "seats": int(s["Seats"]) if (s.get("Seats") or "").isdigit() else None,
            "doors": int(s["Doors"]) if (s.get("Doors") or "").isdigit() else None,
            "luggage": int(s["Luggage"]) if (s.get("Luggage") or "").isdigit() else None,
            "zeroToHundred": float(re.sub(r"[^\d.]", "", zero)) if zero and re.search(r"\d", zero) else None,
            "deposit": "none" if "no deposit" in (s.get("Deposit") or "").lower() else value(s.get("Deposit")),
            "mileageLimitKm": int(re.sub(r"\D", "", s["Mileage Limit"])) if re.search(r"\d", s.get("Mileage Limit") or "") else None,
            "extraKmAed": int(re.sub(r"\D", "", s["Extra Mileage"])) if re.search(r"\d", s.get("Extra Mileage") or "") else None,
            "images": [], "source": p["url"],
        })
        cars[-1].update(fixes.get(p["name"], {}))
        # Only the car's own text – a listing without a description gets none rather than another car's.
        descriptions[slug] = {"blocks": p["blocks"], "faqs": p["faqs"]}
        jobs.append((slug, p["photos"]))

    out_dir = os.path.join(ROOT, "public", "cars")
    shutil.rmtree(out_dir, ignore_errors=True)
    with ThreadPoolExecutor(6) as pool:
        results = list(pool.map(lambda job: save_photos(job[0], job[1], args.cache, out_dir), jobs))
    sources = {}
    for car, (photos, car_sources) in zip(cars, results):
        car["images"] = photos
        sources.update(car_sources)
    cars = [car for car in cars if car["images"]]

    lib = os.path.join(ROOT, "src", "lib")
    json.dump(cars, open(os.path.join(lib, "mkr-fleet.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    json.dump(descriptions, open(os.path.join(lib, "mkr-descriptions.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    json.dump(sources, open(os.path.join(ROOT, "scripts", "mkr-image-sources.json"), "w"), ensure_ascii=False, indent=0)
    print(f"{len(cars)} vehicles, {sum(len(c['images']) for c in cars)} photos written", file=sys.stderr)


if __name__ == "__main__":
    main()
