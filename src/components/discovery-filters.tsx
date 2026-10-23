import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/language";
import { formatEur } from "@/lib/pricing";
import { useSite } from "@/lib/use-site";

export function CategoryTiles() {
  const { language, t } = useLanguage();
  const { categories } = useSite().fleet;
  return (
    <div className="category-grid">
      {categories.map((c) => (
        <Link key={c.id} to="/fleet" search={{ category: c.id }} className="category-tile">
          <img src={c.image} alt="" loading="lazy" />
          <span className="category-tile-text"><strong>{c[language]}</strong><small>{c.count} {t("Fahrzeuge", "cars")} · {t("ab", "from")} {formatEur(c.fromPrice, language)}</small></span>
        </Link>
      ))}
    </div>
  );
}

const SPEED = 38; // px per second, moving right → left
const RESUME_AFTER = 1600; // ms after the last touch/drag

/** Endless, self-scrolling brand row. Swipe or drag in either direction – it never ends. */
export function BrandMarquee() {
  const { t } = useLanguage();
  const { brands } = useSite().fleet;
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, x: 0, left: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const set = () => el.scrollWidth / 3; // the logo list is rendered three times
    let pos = set();
    let ours = pos;
    let pausedUntil = 0;
    let visible = true;
    let frame = 0;
    let last = performance.now();
    el.scrollLeft = pos;

    // Keep the scroll position inside the middle copy so both directions are endless.
    const wrap = () => {
      const width = set();
      if (el.scrollLeft < width * 0.5) el.scrollLeft += width;
      else if (el.scrollLeft > width * 1.5) el.scrollLeft -= width;
      pos = ours = el.scrollLeft;
    };
    const pause = () => { pausedUntil = performance.now() + RESUME_AFTER; };
    const onScroll = () => {
      if (Math.abs(el.scrollLeft - ours) > 2) { pause(); wrap(); }
    };
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64); // same speed on 60 Hz and 120 Hz screens
      last = now;
      if (visible && !reduced && now > pausedUntil && !drag.current.active) {
        pos += (SPEED * dt) / 1000;
        if (pos > set() * 1.5) pos -= set();
        el.scrollLeft = pos;
        ours = el.scrollLeft;
      }
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = Boolean(entry?.isIntersecting); });
    observer.observe(el);
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("wheel", pause, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("wheel", pause);
    };
  }, []);

  // Mouse drag for desktop (touch devices use native swiping).
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    drag.current = { active: true, moved: false, x: e.clientX, left: ref.current.scrollLeft };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active || !ref.current) return;
    if (Math.abs(e.clientX - d.x) > 5) d.moved = true;
    ref.current.scrollLeft = d.left - (e.clientX - d.x);
  };
  const endDrag = () => { drag.current.active = false; };

  return (
    <div
      className="brand-marquee"
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={(e) => { if (drag.current.moved) { e.preventDefault(); drag.current.moved = false; } }}
    >
      {[0, 1, 2].map((copy) => (
        <div key={copy} className="brand-marquee-set" aria-hidden={copy !== 1 || undefined}>
          {brands.map((b) => (
            <Link key={b.id} to="/fleet" search={{ brand: b.id }} className="brand-tile" draggable={false} tabIndex={copy === 1 ? undefined : -1}>
              <span className="brand-logo">{b.image ? <img src={b.image} alt="" width={92} height={58} loading="eager" decoding="async" draggable={false} /> : <b>{b.id.slice(0, 1)}</b>}</span>
              <strong>{b.id}</strong>
              <small>{b.count} {t("Fahrzeuge", "cars")}</small>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
