import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Clock3, MapPin, MessageCircle, ShieldCheck, Sparkles, Star } from "lucide-react";
import founderImage from "@/assets/founder-arda.jpg";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/car-card";
import { cars, heroImage, reviews, whatsappUrl } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "ARDADAGCI — Luxury Car Rental Dubai" },
    { name: "description", content: "Drive Dubai differently with ARDADAGCI's curated supercar and luxury SUV fleet, personal delivery, and 24/7 service." },
    { property: "og:title", content: "ARDADAGCI — Luxury Car Rental Dubai" },
    { property: "og:description", content: "Exceptional cars, personally delivered anywhere in Dubai." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }
  ]}), component: HomePage,
});

function HomePage() { return <>
  <section className="relative min-h-[calc(100svh-4.5rem)] overflow-hidden bg-hero">
    <img src={heroImage} alt="Yellow Lamborghini overlooking the Dubai skyline" width={1920} height={1200} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-[65%_center]" />
    <div className="absolute inset-0 bg-hero-scrim" />
    <div className="site-shell relative flex min-h-[calc(100svh-4.5rem)] flex-col justify-between py-12 sm:py-16 lg:py-20">
      <div className="max-w-3xl animate-reveal"><p className="eyebrow text-hero-foreground/70">Luxury car rental · Dubai</p><h1 className="mt-5 font-display text-[clamp(3.4rem,7vw,7.2rem)] leading-[.88] text-hero-foreground">Drive the<br/>exceptional.</h1><p className="mt-6 max-w-lg text-base leading-7 text-hero-foreground/75 sm:text-lg">A handpicked fleet of the world’s finest cars, delivered with personal service anywhere in Dubai.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button asChild size="xl" variant="light"><Link to="/fleet">Explore fleet <ArrowRight/></Link></Button><Button asChild size="xl" variant="glass"><a href={whatsappUrl()} target="_blank" rel="noreferrer"><MessageCircle/> WhatsApp booking</a></Button></div></div>
      <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3 border-t border-hero-foreground/25 pt-5 text-hero-foreground"><Feature icon={MapPin} title="Free delivery" sub="Across Dubai"/><Feature icon={ShieldCheck} title="Full insurance" sub="Complete cover"/><Feature icon={Clock3} title="24/7 support" sub="Always available"/></div>
    </div>
  </section>

  <section className="site-shell section-space"><SectionHead eyebrow="The collection" title="Featured fleet" copy="Chosen for presence, performance, and the feeling they leave behind." link="/fleet" />
    <div className="mt-10 grid gap-5 md:grid-cols-2">{cars.map(car => <CarCard key={car.slug} car={car}/>)}</div>
  </section>

  <section className="bg-soft"><div className="site-shell section-space grid gap-12 lg:grid-cols-[.86fr_1fr] lg:items-center">
    <div className="relative"><img src={founderImage} alt="Arda, founder of ARDADAGCI" width={1008} height={1312} loading="lazy" className="aspect-[.78] w-full object-cover"/><div className="absolute bottom-0 right-0 bg-accent px-5 py-4 text-accent-foreground"><p className="text-3xl font-semibold">10+</p><p className="text-xs uppercase tracking-widest">Years in Dubai</p></div></div>
    <div className="lg:pl-12"><p className="eyebrow text-accent-strong">Meet your host</p><h2 className="mt-5 font-display text-5xl leading-[.96] sm:text-6xl">Luxury, made personal.</h2><p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">I created ARDADAGCI for people who value more than the badge. Every car is personally selected, inspected, and delivered with the attention I would expect myself.</p><p className="mt-5 max-w-xl leading-7 text-muted-foreground">No call centres. No hidden surprises. Just direct access to a carefully maintained private fleet and a team that knows Dubai.</p><p className="signature mt-8 text-4xl">Arda Dagci</p><div className="mt-10 grid grid-cols-3 gap-5 border-t border-border pt-6"><Stat value="1,200+" label="Happy clients"/><Stat value="4.9/5" label="Average rating"/><Stat value="24/7" label="Concierge"/></div><Button asChild variant="link" className="mt-8 px-0"><Link to="/about">Our story <ArrowRight/></Link></Button></div>
  </div></section>

  <section className="site-shell section-space"><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
    <div><p className="eyebrow text-accent-strong">@ardadagci</p><h2 className="mt-5 font-display text-5xl leading-[.96] sm:text-6xl">Dubai, from the driver’s seat.</h2><p className="mt-6 max-w-lg leading-7 text-muted-foreground">New arrivals, honest walkarounds, and the city’s best driving moments—shared daily.</p><Button asChild variant="outline" size="lg" className="mt-8"><Link to="/tiktok">Watch the showcase <ArrowRight/></Link></Button></div>
    <div className="grid grid-cols-[.7fr_1fr] items-center gap-4 sm:gap-8"><div className="space-y-4"><img src={cars.at(1)?.image ?? heroImage} alt="Porsche in Dubai" width={1408} height={992} loading="lazy" className="aspect-[.8] w-full object-cover"/><p className="text-xs text-muted-foreground">A closer look at the 911 Turbo S</p></div><div className="phone-shell"><div className="phone-screen"><img src={cars.at(0)?.image ?? heroImage} alt="Lamborghini TikTok preview" width={1408} height={992} loading="lazy" className="h-full w-full object-cover"/><div className="absolute inset-x-5 bottom-5 text-hero-foreground"><p className="font-semibold">The sound of Dubai.</p><p className="mt-1 text-xs opacity-75">Huracán EVO · Downtown</p></div></div></div></div>
  </div></section>

  <section className="bg-ink text-ink-foreground"><div className="site-shell section-space"><SectionHead eyebrow="Client notes" title="Driven. Remembered." copy="Real words from people who trusted us with their time in Dubai." light link="/reviews"/><div className="mt-12 grid gap-8 md:grid-cols-3">{reviews.slice(0,3).map(r=><article key={r.name} className="border-t border-ink-line pt-6"><div className="flex gap-1 text-accent"><Star className="size-4 fill-current"/><Star className="size-4 fill-current"/><Star className="size-4 fill-current"/><Star className="size-4 fill-current"/><Star className="size-4 fill-current"/></div><blockquote className="mt-6 font-display text-2xl leading-snug">“{r.quote}”</blockquote><p className="mt-8 text-sm font-medium">{r.name}</p><p className="mt-1 text-xs text-ink-muted">{r.location} · {r.car}</p></article>)}</div></div></section>

  <section className="bg-accent text-accent-foreground"><div className="site-shell py-20 lg:py-28"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="eyebrow">Your Dubai drive starts here</p><h2 className="mt-5 max-w-4xl font-display text-5xl leading-[.95] sm:text-7xl">Tell us the car.<br/>We’ll handle the rest.</h2></div><Button asChild size="xl" variant="dark"><a href={whatsappUrl("Hello ARDADAGCI, I am ready to plan my Dubai drive.")} target="_blank" rel="noreferrer"><MessageCircle/> Start on WhatsApp</a></Button></div></div></section>
</>; }

function Feature({ icon: Icon, title, sub }: { icon: typeof MapPin; title: string; sub: string }) { return <div className="min-w-0"><Icon className="mb-3 size-5"/><p className="text-xs font-semibold sm:text-sm">{title}</p><p className="mt-1 hidden text-xs opacity-60 sm:block">{sub}</p></div> }
function Stat({value,label}:{value:string;label:string}) { return <div><p className="text-xl font-semibold sm:text-2xl">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div> }
function SectionHead({eyebrow,title,copy,link,light=false}:{eyebrow:string;title:string;copy:string;link:string;light?:boolean}) { return <div className="grid gap-5 lg:grid-cols-[1fr_.65fr] lg:items-end"><div><p className={`eyebrow ${light?"text-ink-muted":"text-accent-strong"}`}>{eyebrow}</p><h2 className="mt-4 font-display text-5xl leading-none sm:text-6xl">{title}</h2></div><div className="flex items-end justify-between gap-5"><p className={`max-w-md leading-7 ${light?"text-ink-muted":"text-muted-foreground"}`}>{copy}</p><Button asChild variant={light?"ghostLight":"ghost"} size="icon"><Link to={link}><ArrowRight/><span className="sr-only">View all</span></Link></Button></div></div> }
