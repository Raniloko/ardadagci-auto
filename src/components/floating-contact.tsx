import { MessageCircle, Phone } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { PHONE_NUMBER, whatsappUrl } from "@/lib/site-data";

export function FloatingContact() {
  const { t } = useLanguage();
  return <div className="floating-contact" aria-label={t("Direktkontakt", "Direct contact")}>
    <a href={`tel:${PHONE_NUMBER}`} aria-label={t("Jetzt anrufen", "Call now")} className="floating-call"><Phone /></a>
    <a href={whatsappUrl()} target="_blank" rel="noreferrer" aria-label={t("WhatsApp öffnen", "Open WhatsApp")} className="floating-whatsapp"><MessageCircle /><span>WhatsApp</span></a>
  </div>;
}
