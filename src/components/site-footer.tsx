import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, MessageCircle, Music2, Phone } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { brands, categories, EMAIL, PHONE_NUMBER, whatsappUrl } from "@/lib/site-data";

export function SiteFooter() {
  const { language, t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="site-shell footer-top">
        <div className="footer-brand">
          <Link to="/" className="brand-mark"><img src="/ardadagci-logo.png" alt="" width={44} height={44} /><span><strong>ARDADAGCI</strong><small>Dubai Car Rental</small></span></Link>
          <p>{t("Luxus- und Sportwagen in Dubai – ohne Kaution, mit Lieferung und persönlichem Service auf Deutsch.", "Luxury and sports cars in Dubai – no deposit, delivered, with personal service.")}</p>
          <div className="footer-social">
            <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer" aria-label="TikTok"><Music2 /></a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram /></a>
            <a href={whatsappUrl()} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle /></a>
          </div>
        </div>
        <div>
          <h3>{t("Kategorien", "Categories")}</h3>
          {categories.map((c) => <Link key={c.id} to="/fleet" search={{ category: c.id }}>{c[language]}</Link>)}
        </div>
        <div>
          <h3>{t("Marken", "Brands")}</h3>
          {brands.slice(0, 8).map((b) => <Link key={b.id} to="/fleet" search={{ brand: b.id }}>{b.id}</Link>)}
        </div>
        <div>
          <h3>{t("Kontakt", "Contact")}</h3>
          <a href={`tel:${PHONE_NUMBER}`}><Phone />{PHONE_NUMBER}</a>
          <a href={`mailto:${EMAIL}`}><Mail />{EMAIL}</a>
          <span><MapPin />Dubai, {t("Vereinigte Arabische Emirate", "United Arab Emirates")}</span>
          <Link to="/booking" search={{ car: "" }}>{t("Reservierung anfragen", "Request a booking")}</Link>
        </div>
      </div>
      <div className="site-shell footer-bottom">
        <span>© {new Date().getFullYear()} ARDADAGCI · Dubai Car Rental</span>
        <nav><Link to="/about">{t("Über uns", "About")}</Link><Link to="/reviews">{t("Bewertungen", "Reviews")}</Link><Link to="/contact">{t("Kontakt", "Contact")}</Link></nav>
      </div>
    </footer>
  );
}
