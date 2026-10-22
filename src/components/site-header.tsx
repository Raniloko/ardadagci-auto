import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";
import { PHONE_NUMBER } from "@/lib/site-data";

const links = [
  ["Flotte", "Fleet", "/fleet"], ["Über uns", "About", "/about"], ["Bewertungen", "Reviews", "/reviews"],
  ["TikTok", "TikTok", "/tiktok"], ["Kontakt", "Contact", "/contact"],
] as const;

export function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);
  const overlay = pathname === "/" && !scrolled && !open;
  return (
    <header className={`site-header ${overlay ? "is-overlay" : ""}`}>
      <div className="header-inner">
        <Link to="/" className="brand-mark" aria-label={t("ARDADAGCI Startseite", "ARDADAGCI home")}>
          <img src="/ardadagci-logo.png" alt="" width={44} height={44} />
          <span><strong>ARDADAGCI</strong><small>Dubai Car Rental</small></span>
        </Link>
        <nav className="desktop-nav" aria-label={t("Hauptnavigation", "Main navigation")}>
          {links.map(([de, en, to]) => <Link key={to} to={to}>{t(de, en)}</Link>)}
        </nav>
        <div className="header-actions">
          <div className="language-toggle" role="group" aria-label={t("Sprache wählen", "Choose language")}>
            {(["de", "en"] as const).map((code) => <button key={code} type="button" aria-pressed={language === code} className={language === code ? "active" : ""} onClick={() => setLanguage(code)}>{code.toUpperCase()}</button>)}
          </div>
          <a className="header-phone" href={`tel:${PHONE_NUMBER}`} aria-label={t("Anrufen", "Call us")}><Phone /></a>
          <Link to="/booking" search={{ car: "" }} className="btn btn-light header-cta">{t("Jetzt buchen", "Book now")}</Link>
          <button type="button" className="menu-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? t("Menü schließen", "Close menu") : t("Menü öffnen", "Open menu")}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label={t("Mobile Navigation", "Mobile navigation")}>
          <Link to="/">{t("Start", "Home")}</Link>
          {links.map(([de, en, to]) => <Link key={to} to={to}>{t(de, en)}</Link>)}
          <Link to="/booking" search={{ car: "" }} className="btn btn-light">{t("Jetzt buchen", "Book now")}</Link>
        </nav>
      )}
    </header>
  );
}
