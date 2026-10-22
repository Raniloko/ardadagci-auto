import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/lib/language";
import { formatEur } from "@/lib/pricing";
import { brands, categories } from "@/lib/site-data";
import { Rail } from "./car-rail";

export function CategoryTiles() {
  const { language, t } = useLanguage();
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

export function BrandRail() {
  const { t } = useLanguage();
  return (
    <Rail className="brand-rail">
      {brands.map((b) => (
        <Link key={b.id} to="/fleet" search={{ brand: b.id }} className="brand-tile">
          <span className="brand-logo">{b.image ? <img src={b.image} alt="" loading="lazy" /> : <b>{b.id.slice(0, 1)}</b>}</span>
          <strong>{b.id}</strong>
          <small>{b.count} {t("Fahrzeuge", "cars")}</small>
        </Link>
      ))}
    </Rail>
  );
}
