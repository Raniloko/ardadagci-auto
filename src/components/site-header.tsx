import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logoAsset from "@/assets/ardadagci-logo.png.asset.json";
import { useLanguage } from "@/lib/language";

const links = [
  ["Start", "Home", "/"], ["Flotte", "Fleet", "/fleet"], ["Über uns", "About", "/about"],
  ["TikTok", "TikTok", "/tiktok"], ["Bewertungen", "Reviews", "/reviews"], ["Kontakt", "Contact", "/contact"],
] as const;

export function SiteHeader() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="header-inner">
      <button className="menu-trigger" onClick={() => setOpen(!open)} aria-label={open ? "Menü schließen" : "Menü öffnen"}>{open ? <X /> : <Menu />}</button>
      <nav className="desktop-nav" aria-label="Hauptnavigation">{links.slice(0, 3).map(([de,en,to]) => <Link key={to} to={to}>{language === "de" ? de : en}</Link>)}</nav>
      <Link to="/" className="center-logo" aria-label="ARDADAGCI Startseite"><img src={logoAsset.url} alt="ARDADAGCI Dubai Car Rental" /></Link>
      <nav className="desktop-nav desktop-nav-right" aria-label="Weitere Navigation">{links.slice(3).map(([de,en,to]) => <Link key={to} to={to}>{language === "de" ? de : en}</Link>)}</nav>
      <div className="language-toggle" aria-label="Sprache wählen"><button className={language === "de" ? "active" : ""} onClick={() => setLanguage("de")}>DE</button><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button></div>
    </div>
    {open && <nav className="mobile-nav" aria-label="Mobile Navigation">{links.map(([de,en,to]) => <Link key={to} to={to} onClick={() => setOpen(false)}>{language === "de" ? de : en}</Link>)}<Link to="/booking" search={{ car: "" }} onClick={() => setOpen(false)}>{language === "de" ? "Jetzt reservieren" : "Book now"}</Link></nav>}
  </header>;
}
