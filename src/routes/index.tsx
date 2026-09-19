import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, MapPin, MessageCircle, Play, ShieldCheck, Star } from "lucide-react";
import founderImage from "@/assets/founder-arda.jpg";
import logoAsset from "@/assets/ardadagci-logo-white.png.asset.json";
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
  <section className="relative overflow-hidden border-b border-border bg-background">
    <img src={heroImage} alt="Black Lamborghini with the Dubai skyline" width={1920} height={1080} fetchPriority="high" className="h-[17rem] w-full object-cover object-[64%_center] sm:h-[28rem] lg:absolute lg:inset-0 lg:h-full" />
    <div className="site-shell relative grid min-h-[39rem] items-center lg:grid-cols-2">
      <div className="order-2 max-w-xl bg-background py-10 animate-reveal lg:order-1 lg:bg-transparent lg:py-16"><p className="eyebrow text-muted-foreground">Luxury car rental in Dubai</p><h1 className="mt-4 font-display text-[clamp(2.55rem,4.3vw,4.65rem)] leading-[1.04]">Experience Dubai<br/>Behind the Wheel of<br/>the World’s Most<br/>Exclusive Supercars.</h1><p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">From Ferrari to Lamborghini — we offer the finest supercars in Dubai. Fast, safe and with premium concierge service.</p><div className="mt-6 flex flex-wrap gap-3"><Button asChild size="lg"><Link to="/fleet">Explore Fleet <ArrowRight/></Link></Button><Button asChild size="lg" variant="outline"><a href={whatsappUrl()} target="_blank" rel="noreferrer"><MessageCircle/> WhatsApp Booking</a></Button></div><div className="mt-8 grid max-w-lg grid-cols-3 gap-3"><Feature icon={MapPin} title="Free Delivery"/><Feature icon={ShieldCheck} title="Full Insurance"/><Feature icon={Clock3} title="24/7 Support"/></div></div>
    </div>
  </section>

  <section className="site-shell section-space"><SectionHead eyebrow="Featured cars" title="Our Premium Fleet" link="/fleet" />
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cars.map(car => <CarCard key={car.slug} car={car}/>)}</div>
  </section>

  <section><div className="site-shell section-space grid gap-5 lg:grid-cols-[.78fr_1.2fr_.58fr] lg:items-stretch">
    <img src={founderImage} alt="Arda, founder of ARDADAGCI" width={1008} height={1312} loading="lazy" className="aspect-[.92] h-full w-full rounded-md object-cover object-top"/>
    <div className="flex flex-col justify-center px-1 py-5 lg:px-8"><p className="eyebrow text-muted-foreground">About Arda</p><h2 className="mt-2 font-display text-3xl">Meet Arda</h2><p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">I’m Arda Dagci, the founder of Ardadagci Dubai Car Rental. My goal is to give you the best luxury car experience in Dubai.</p><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">With a passion for supercars and a strong community on TikTok, I make dream drives a reality.</p><div className="mt-7 grid grid-cols-3 divide-x divide-border"><Stat value="2M+" label="TikTok Followers"/><Stat value="100M+" label="Total Views"/><Stat value="5,000+" label="Happy Customers"/></div><p className="signature mt-6 text-3xl">Arda Dagci</p><p className="mt-1 text-[.55rem] font-bold uppercase tracking-[.18em] text-muted-foreground">Founder & CEO</p></div>
    <div className="flex min-h-60 flex-col items-center justify-center rounded-md bg-soft p-8 text-center"><img src={logoAsset.url} alt="ARDADAGCI" className="w-36"/><p className="mt-5 text-sm leading-6 text-muted-foreground">More than just a rental.<br/>It’s a lifestyle.</p></div>
  </div></section>

  <section className="site-shell border-t border-border py-10"><div className="grid gap-8 lg:grid-cols-[.62fr_1.38fr] lg:items-center">
    <div><p className="eyebrow text-muted-foreground">Social media</p><h2 className="mt-2 font-display text-3xl leading-tight">Trusted by Millions<br/>on TikTok</h2><p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Follow our journey for exclusive cars, behind the scenes and daily content from Dubai.</p><Button asChild size="sm" className="mt-5 rounded-full"><Link to="/tiktok">Follow on TikTok</Link></Button></div>
    <div className="grid grid-cols-[.72fr_repeat(4,minmax(0,1fr))] items-end gap-3"><div className="phone-shell"><div className="phone-screen"><img src={cars.at(0)?.image ?? heroImage} alt="ARDADAGCI TikTok profile" className="h-full w-full object-cover"/></div></div>{cars.map((car,i)=><Link key={car.slug} to="/fleet/$slug" params={{slug:car.slug}} className="group relative hidden overflow-hidden rounded-md sm:block"><img src={car.image} alt={`${car.brand} TikTok preview`} className="aspect-[.62] w-full object-cover transition-transform duration-500 group-hover:scale-105"/><span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[.6rem] text-hero-foreground"><Play className="size-3 fill-current"/>{["1.2M","856K","2.3M","1.5M"][i] ?? "1M"}</span></Link>)}</div>
  </div></section>

  <section className="site-shell border-t border-border py-10"><p className="eyebrow text-muted-foreground">Reviews</p><h2 className="mt-2 font-display text-2xl">What Our Customers Say</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{reviews.slice(0,3).map((r,i)=><article key={r.name} className="grid grid-cols-[auto_1fr_auto] gap-3 rounded-md border border-border p-4"><span className="grid size-9 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">{r.name.charAt(0)}</span><div><p className="text-xs font-semibold">{r.name}</p><p className="text-[.6rem] text-muted-foreground">Verified Customer</p><div className="mt-1 flex gap-0.5">{Array.from({length:5}).map((_,n)=><Star key={n} className="size-2.5 fill-current"/>)}</div></div><img src={cars.at(i)?.image ?? heroImage} alt="Customer rental" className="h-12 w-20 rounded object-cover"/><blockquote className="col-span-3 mt-1 text-xs leading-5 text-muted-foreground">“{r.quote}”</blockquote></article>)}</div></section>

  <section className="site-shell pb-8"><div className="relative overflow-hidden rounded-md bg-soft px-6 py-8 sm:px-10"><img src={heroImage} alt="Luxury car in Dubai" className="absolute inset-y-0 right-0 hidden h-full w-[58%] object-cover object-right sm:block"/><div className="relative max-w-md"><p className="eyebrow text-muted-foreground">Ready to drive?</p><h2 className="mt-2 font-display text-2xl">Book Your Dream Car Today</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">Fast, secure and hassle-free. Get in touch now via WhatsApp and let’s make it happen.</p><Button asChild size="sm" className="mt-5 rounded-full"><a href={whatsappUrl("Hello ARDADAGCI, I would like to book my dream car in Dubai.")} target="_blank" rel="noreferrer"><MessageCircle/> Book via WhatsApp <ArrowRight/></a></Button></div></div></section>
</>; }

function Feature({ icon: Icon, title }: { icon: typeof MapPin; title: string }) { return <div className="flex min-w-0 items-center gap-2"><Icon className="size-3.5 shrink-0 text-muted-foreground"/><p className="text-[.65rem] text-muted-foreground">{title}</p></div> }
function Stat({value,label}:{value:string;label:string}) { return <div className="px-3 first:pl-0"><p className="text-xl font-semibold">{value}</p><p className="mt-1 text-[.6rem] text-muted-foreground">{label}</p></div> }
function SectionHead({eyebrow,title,link}:{eyebrow:string;title:string;link:string}) { return <div className="flex items-end justify-between gap-5"><div><p className="eyebrow text-muted-foreground">{eyebrow}</p><h2 className="mt-2 font-display text-3xl">{title}</h2></div><Button asChild variant="link" className="h-auto px-0 text-[.65rem]"><Link to={link}>View All Cars <ArrowRight/></Link></Button></div> }
