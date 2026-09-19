import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import logoAsset from "@/assets/ardadagci-logo-white.png.asset.json";

const links = [
  ["Home", "/"], ["Fleet", "/fleet"], ["About", "/about"], ["TikTok", "/tiktok"], ["Reviews", "/reviews"], ["Contact", "/contact"],
] as const;

export function SiteHeader() {
  return <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md transition-all duration-300">
    <div className="site-shell grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:h-[4.5rem] lg:grid-cols-[1fr_auto_1fr]">
      <Link to="/" className="min-w-0 justify-self-start" aria-label="ARDADAGCI home"><img src={logoAsset.url} alt="ARDADAGCI Dubai Car Rental" width={220} height={95} className="h-11 w-auto object-contain" /></Link>
      <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary navigation">
        {links.map(([label, to]) => <Link key={to} to={to} className="nav-link" activeProps={{ className: "nav-link text-foreground after:scale-x-100" }}>{label}</Link>)}
      </nav>
      <Button asChild size="sm" className="hidden justify-self-end rounded-full px-5 lg:inline-flex"><Link to="/booking" search={{ car: "" }}>Book Now</Link></Button>
      <div className="justify-self-end lg:hidden">
        <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open menu"><Menu /></Button></SheetTrigger>
          <SheetContent className="w-full max-w-sm border-l-border p-8"><SheetTitle className="text-left"><img src={logoAsset.url} alt="ARDADAGCI" className="h-12 w-auto" /></SheetTitle>
            <nav className="mt-16 flex flex-col gap-1">{links.map(([label,to]) => <SheetClose asChild key={to}><Link to={to} className="border-b border-border py-5 text-2xl font-medium">{label}</Link></SheetClose>)}</nav>
            <Button asChild size="lg" className="mt-8 w-full"><Link to="/booking" search={{ car: "" }}>Book now</Link></Button>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>;
}
