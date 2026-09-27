import { MessageCircle, Phone } from "lucide-react";
import { whatsappUrl } from "@/lib/site-data";

export function FloatingContact() {
  return <div className="floating-contact" aria-label="Direktkontakt">
    <a href={whatsappUrl()} target="_blank" rel="noreferrer" aria-label="WhatsApp öffnen" className="floating-whatsapp"><MessageCircle /></a>
    <a href="tel:+971589278720" aria-label="Jetzt anrufen" className="floating-call"><Phone /></a>
  </div>;
}
