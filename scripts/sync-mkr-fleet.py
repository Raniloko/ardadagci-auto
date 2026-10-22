#!/usr/bin/env python3
"""Sync the Dubai fleet from mkrentacar.com (Masterkey Rent A Car, partner supplier).

Writes:
  src/lib/mkr-fleet.json         – vehicle identities, specs, MKR base price (AED) and gallery
  src/lib/mkr-descriptions.json  – long descriptions + FAQs per vehicle (loaded per detail page)

The MKR base price is the partner price that must be paid to MKR. The customer price shown on
the ARDADAGCI website is calculated at runtime in `src/lib/pricing.ts`.

Prices inside descriptions are stored as `{{aed:1234}}` tokens so the site can render them with
the ARDADAGCI price instead of leaking the partner price. Supplier branding is replaced with
ARDADAGCI.

Usage:  pip install beautifulsoup4 && python3 scripts/sync-mkr-fleet.py [--cache .mkr-cache]
"""

import argparse
import html
import json
import os
import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITEMAP = "https://mkrentacar.com/car-sitemap.xml"
MEDIA_API = "https://mkrentacar.com/wp-json/wp/v2/media?per_page=100&_fields=source_url,media_details&page="
RESPONSIVE_SIZES = ("medium", "medium_large", "large")
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


def media_sizes():
    """Map every MKR upload URL to its full width and resized WordPress variants (e.g. "768x520")."""
    sizes, page = {}, 1
    while True:
        try:
            with urllib.request.urlopen(urllib.request.Request(MEDIA_API + str(page), headers=UA), timeout=60) as res:
                items = json.load(res)
        except urllib.error.HTTPError:
            break
        if not items:
            break
        for item in items:
            src, details = item["source_url"], item.get("media_details") or {}
            base, _, ext = src.rpartition(".")
            variants = []
            for key in RESPONSIVE_SIZES:
                match = re.fullmatch(re.escape(base) + r"-(\d+x\d+)\." + re.escape(ext), ((details.get("sizes") or {}).get(key) or {}).get("source_url", ""))
                if match:
                    variants.append(match.group(1))
            sizes[src] = {"w": details.get("width"), "v": variants}
        page += 1
    return sizes


def responsive(images, sizes):
    return [{"src": src, "w": (sizes.get(src) or {}).get("w"), "v": (sizes.get(src) or {}).get("v", [])} for src in images]


def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", default=None, help="directory to cache downloaded pages")
    args = ap.parse_args()
    if args.cache:
        os.makedirs(args.cache, exist_ok=True)
    sitemap = fetch(SITEMAP, None)
    urls = sorted({u for u in re.findall(r"<loc>([^<]+)</loc>", sitemap) if "/ar/" not in u and "/abu-dhabi/" not in u and u.rstrip("/") != "https://mkrentacar.com/car"})
    with ThreadPoolExecutor(6) as pool:
        bodies = list(pool.map(lambda u: fetch(u, args.cache), urls))
    parsed = [p for p in (parse(u, b) for u, b in zip(urls, bodies)) if p]
    sizes = media_sizes()

    by_name = {}
    for p in parsed:
        if p["blocks"]:
            by_name.setdefault(p["name"].lower(), p)
    seen_images, cars, descriptions, used = set(), [], {}, set()
    for p in sorted(parsed, key=lambda p: (p["name"].lower(), p["url"])):
        if p["images"][0] in seen_images:
            continue
        seen_images.add(p["images"][0])
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
        source = p if p["blocks"] else by_name.get(p["name"].lower(), p)
        cars.append({
            "slug": slug, "brand": brand, "name": model_of(p["name"], brand), "title": p["name"], "category": category,
            "baseDailyAed": p["price"], "color": color, "engine": value(s.get("Engine")), "drive": value(s.get("Drive")),
            "fuel": value(s.get("Fuel")), "transmission": value(s.get("Transmission")),
            "seats": int(s["Seats"]) if (s.get("Seats") or "").isdigit() else None,
            "doors": int(s["Doors"]) if (s.get("Doors") or "").isdigit() else None,
            "luggage": int(s["Luggage"]) if (s.get("Luggage") or "").isdigit() else None,
            "zeroToHundred": float(re.sub(r"[^\d.]", "", zero)) if zero and re.search(r"\d", zero) else None,
            "deposit": "none" if "no deposit" in (s.get("Deposit") or "").lower() else value(s.get("Deposit")),
            "mileageLimitKm": int(re.sub(r"\D", "", s["Mileage Limit"])) if re.search(r"\d", s.get("Mileage Limit") or "") else None,
            "extraKmAed": int(re.sub(r"\D", "", s["Extra Mileage"])) if re.search(r"\d", s.get("Extra Mileage") or "") else None,
            "images": responsive(p["images"], sizes), "source": p["url"],
        })
        descriptions[slug] = {"blocks": source["blocks"], "faqs": source["faqs"] or p["faqs"]}

    lib = os.path.join(ROOT, "src", "lib")
    json.dump(cars, open(os.path.join(lib, "mkr-fleet.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    json.dump(descriptions, open(os.path.join(lib, "mkr-descriptions.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print(f"{len(cars)} vehicles written", file=sys.stderr)


if __name__ == "__main__":
    main()
