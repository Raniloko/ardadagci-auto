import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [["HOME", "/"], ["BRANDS", "/fleet"], ["CATEGORIES", "/fleet"], ["CARS", "/fleet"], ["CONTACT US", "/contact"], ["ABOUT US", "/about"], ["BLOGS", "/reviews"]] as const;

export function SiteHeader() {
  return <header className="vip-header">
    <div className="vip-nav">
      <Link to="/" className="vip-logo" aria-label="VIP Rent a Car home"><strong>VIP</strong><small>RENT A CAR</small></Link>
      <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
        {links.map(([label, to], i) => <Link key={label} to={to} className="vip-nav-link">{label}{(i === 1 || i === 2) && <ChevronDown className="size-3.5" />}</Link>)}
      </nav>
      <div className="flex items-center gap-3">
        <button className="vip-search" aria-label="Search"><Search className="size-4" /></button>
        <a className="vip-phone hidden sm:inline-flex" href="tel:+971589278720">971 58 927 8720</a>
        <button className="vip-select hidden sm:inline-flex">AED / EN <ChevronDown className="size-3.5" /></button>
        <Button asChild size="sm" className="hidden rounded-md bg-[#0862c5] px-3 text-xs font-normal hover:bg-[#0755aa] sm:inline-flex"><Link to="/booking" search={{ car: "" }}>SIGN IN</Link></Button>
        <div className="lg:hidden"><Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open menu"><Menu /></Button></SheetTrigger><SheetContent><SheetTitle>VIP RENT A CAR</SheetTitle><nav className="mt-8 flex flex-col gap-5">{links.map(([label,to]) => <SheetClose asChild key={label}><Link to={to} className="text-lg">{label}</Link></SheetClose>)}</nav></SheetContent></Sheet></div>
      </div>
    </div>
  </header>;
}
