import { Link } from "@tanstack/react-router";
import { Instagram, MapPin, Music2 } from "lucide-react";
import logoAsset from "@/assets/ardadagci-logo.png.asset.json";
import { useLanguage } from "@/lib/language";
export function SiteFooter(){const {language}=useLanguage();return <footer className="site-footer"><div className="site-shell footer-grid"><Link to="/"><img src={logoAsset.url} alt="ARDADAGCI Dubai Car Rental" className="footer-logo"/></Link><nav><Link to="/fleet">{language==="de"?"Flotte":"Fleet"}</Link><Link to="/about">{language==="de"?"Über uns":"About"}</Link><Link to="/contact">{language==="de"?"Kontakt":"Contact"}</Link></nav><div className="footer-meta"><a href="https://www.tiktok.com/" aria-label="TikTok"><Music2/></a><a href="https://www.instagram.com/" aria-label="Instagram"><Instagram/></a><span><MapPin/>Dubai, UAE</span><span>© 2026 ARDADAGCI</span></div></div></footer>}
