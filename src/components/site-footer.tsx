import { Link } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Music2, Phone } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { useSite } from "@/lib/use-site";

export function SiteFooter() {
  const { language, t } = useLanguage();
  const { fleet: { brands, categories }, contact } = useSite();
  return (
    <footer className="site-footer">
      <div className="site-shell footer-top">
        <div className="footer-brand">
          <Link to="/" className="brand-mark"><img src="/ardadagci-mark.png" alt="" width={260} height={192} /><span><strong>ARDADAGCI</strong><small>Dubai Car Rental</small></span></Link>
          <p>{t("Luxus- und Sportwagen in Dubai – ohne Kaution, mit Lieferung und persönlichem Service auf Deutsch.", "Luxury and sports cars in Dubai – no deposit, delivered, with personal service.")}</p>
          <div className="footer-social">
            {contact.tiktokUrl && <a href={contact.tiktokUrl} target="_blank" rel="noreferrer" aria-label={`TikTok ${contact.tiktokHandle}`}><Music2 /></a>}
            <a href={contact.whatsappUrl()} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle /></a>
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
          <a href={`tel:${contact.phoneNumber}`}><Phone />{contact.phoneDisplay}</a>
          {contact.email && <a href={`mailto:${contact.email}`}><Mail />{contact.email}</a>}
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
