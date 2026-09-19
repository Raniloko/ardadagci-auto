import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Instagram } from "lucide-react";
import { whatsappUrl } from "@/lib/site-data";

export function SiteFooter() { return <footer className="bg-ink text-ink-foreground">
  <div className="site-shell py-16 lg:py-24"><div className="grid gap-14 lg:grid-cols-[1.4fr_.7fr_.7fr]">
    <div><Link to="/" className="text-xl font-bold tracking-[0.16em]">ARDADAGCI</Link><p className="mt-5 max-w-sm text-sm leading-7 text-ink-muted">Exceptional cars. Personal service. Delivered anywhere in Dubai.</p></div>
    <div><p className="eyebrow text-ink-muted">Explore</p><div className="mt-5 grid gap-3 text-sm"><Link to="/fleet">Our fleet</Link><Link to="/about">About Arda</Link><Link to="/reviews">Client reviews</Link><Link to="/contact">Contact</Link></div></div>
    <div><p className="eyebrow text-ink-muted">Connect</p><div className="mt-5 grid gap-3 text-sm"><a href={whatsappUrl()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">WhatsApp <ArrowUpRight className="size-3" /></a><Link to="/tiktok" className="inline-flex items-center gap-2"><Instagram className="size-3" /> TikTok showcase</Link><a href="mailto:hello@ardadagci.com">hello@ardadagci.com</a></div></div>
  </div><div className="mt-16 flex flex-col gap-3 border-t border-ink-line pt-6 text-xs text-ink-muted sm:flex-row sm:justify-between"><p>© 2026 ARDADAGCI Dubai Car Rental.</p><p>Private fleet · Dubai, UAE</p></div></div>
</footer>; }
