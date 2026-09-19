import { Link } from "@tanstack/react-router";
import { Instagram, MapPin, Music2 } from "lucide-react";
import logoAsset from "@/assets/ardadagci-logo-white.png.asset.json";

export function SiteFooter() { return <footer className="border-t border-border bg-background">
  <div className="site-shell grid gap-8 py-7 text-[.68rem] text-muted-foreground sm:grid-cols-[1fr_auto_1fr] sm:items-center">
    <Link to="/" className="justify-self-start"><img src={logoAsset.url} alt="ARDADAGCI Dubai Car Rental" width={180} height={78} className="h-10 w-auto" /></Link>
    <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-foreground" aria-label="Footer navigation"><Link to="/">Home</Link><Link to="/fleet">Fleet</Link><Link to="/about">About</Link><Link to="/tiktok">TikTok</Link><Link to="/reviews">Reviews</Link><Link to="/contact">Contact</Link></nav>
    <div className="flex flex-wrap items-center gap-4 sm:justify-self-end"><a href="https://www.tiktok.com/" aria-label="TikTok"><Music2 className="size-4"/></a><a href="https://www.instagram.com/" aria-label="Instagram"><Instagram className="size-4"/></a><span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5"/>Dubai, UAE</span><span>© 2026 ARDADAGCI.</span></div>
  </div>
</footer>; }
