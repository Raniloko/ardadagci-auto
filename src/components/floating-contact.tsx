import { MessageCircle, Phone } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { useSite } from "@/lib/use-site";

export function FloatingContact() {
  const { t } = useLanguage();
  const { contact } = useSite();
  return <div className="floating-contact" aria-label={t("Direktkontakt", "Direct contact")}>
    <a href={`tel:${contact.phoneNumber}`} aria-label={t("Jetzt anrufen", "Call now")} className="floating-call"><Phone /></a>
    <a href={contact.whatsappUrl()} target="_blank" rel="noreferrer" aria-label={t("WhatsApp öffnen", "Open WhatsApp")} className="floating-whatsapp"><MessageCircle /><span>WhatsApp</span></a>
  </div>;
}
