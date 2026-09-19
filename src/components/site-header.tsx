import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  ["Home", "/"], ["Fleet", "/fleet"], ["About", "/about"], ["TikTok", "/tiktok"], ["Reviews", "/reviews"], ["Contact", "/contact"],
] as const;

export function SiteHeader() {
  return <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
    <div className="site-shell grid h-18 grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <Link to="/" className="min-w-0 text-[1.05rem] font-bold tracking-[0.16em]">ARDADAGCI<span className="ml-2 text-[0.58rem] font-medium tracking-[0.18em] text-muted-foreground">DUBAI</span></Link>
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
        {links.map(([label, to]) => <Link key={to} to={to} className="nav-link" activeProps={{ className: "nav-link text-foreground after:scale-x-100" }}>{label}</Link>)}
        <Button asChild size="lg"><Link to="/booking">Book now</Link></Button>
      </nav>
      <div className="lg:hidden">
        <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open menu"><Menu /></Button></SheetTrigger>
          <SheetContent className="w-full max-w-sm border-l-border p-8"><SheetTitle className="text-left text-sm tracking-[0.16em]">ARDADAGCI</SheetTitle>
            <nav className="mt-16 flex flex-col gap-1">{links.map(([label,to]) => <SheetClose asChild key={to}><Link to={to} className="border-b border-border py-5 text-2xl font-medium">{label}</Link></SheetClose>)}</nav>
            <Button asChild size="lg" className="mt-8 w-full"><Link to="/booking">Book now</Link></Button>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>;
}
