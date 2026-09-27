import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/car-card";
import { DiscoveryFilters, type FleetFilter } from "@/components/discovery-filters";
import { useLanguage } from "@/lib/language";
import { mkrHero } from "@/lib/mkr-assets";
import { cars } from "@/lib/site-data";

export const Route=createFileRoute("/")({head:()=>({meta:[{title:"ARDADAGCI — Luxury Car Rental in Dubai"},{name:"description",content:"Luxus-, Sport- und SUV-Mietwagen in Dubai ohne Kaution. Direkt per WhatsApp reservieren."},{property:"og:title",content:"ARDADAGCI — Luxury Car Rental in Dubai"},{property:"og:description",content:"Exklusive Mietwagen in Dubai. Ohne Kaution und direkt reservierbar."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:HomePage});

function HomePage(){
 const {language}=useLanguage();const navigate=useNavigate({from:"/"});const [filter,setFilter]=useState<FleetFilter>({type:"all",value:""});const [query,setQuery]=useState("");
 const filtered=useMemo(()=>cars.filter(car=>{const matchFilter=filter.type==="all"||(filter.type==="brand"?car.brand===filter.value:car.category===filter.value);const text=`${car.brand} ${car.name}`.toLowerCase();return matchFilter&&text.includes(query.toLowerCase())}),[filter,query]);
 function search(e:FormEvent){e.preventDefault();document.querySelector("#fleet")?.scrollIntoView({behavior:"smooth"})}
 return <div>
  <section className="home-hero">
   <div className="site-shell hero-content"><p>{language==="de"?"Willkommen bei Masterkey Rent A Car":"Welcome to Masterkey Rent A Car"}</p><h1>Luxury Car Rental in Dubai</h1>
    <form className="hero-search" onSubmit={search}><span className="location"><MapPin/>Dubai <span>⌄</span></span><span className="search-divider"/><label><Search/><input aria-label={language==="de"?"Marke oder Modell suchen":"Search brand or model"} value={query} onChange={e=>setQuery(e.target.value)} placeholder={language==="de"?"Suche nach Marke/Modell":"Search brand/model"}/></label><Button type="submit" size="icon" aria-label={language==="de"?"Suchen":"Search"}><ArrowRight/></Button></form>
    <img className="hero-ferrari" src={mkrHero} alt="Schwarzer Ferrari SF90" />
   </div>
  </section>
  <section className="discovery-section site-shell"><DiscoveryFilters active={filter} onChange={next=>{setFilter(next);requestAnimationFrame(()=>document.querySelector("#fleet")?.scrollIntoView({behavior:"smooth",block:"start"}))}}/></section>
  <section id="fleet" className="site-shell fleet-home"><div className="section-title"><div><p>{language==="de"?"Unsere Flotte":"Our fleet"}</p><h2>{language==="de"?"Wählen Sie Ihren Traumwagen":"Choose your dream car"}</h2></div><span>{filtered.length} {language==="de"?"Fahrzeuge":"cars"}</span></div>{filtered.length?<div className="fleet-grid">{filtered.map(car=><CarCard key={car.slug} car={car}/>)}</div>:<div className="empty-fleet"><p>{language==="de"?"Keine Fahrzeuge für diese Auswahl gefunden.":"No cars found for this selection."}</p><Button variant="outline" onClick={()=>{setFilter({type:"all",value:""});setQuery("")}}>{language==="de"?"Filter zurücksetzen":"Reset filters"}</Button></div>}<div className="fleet-more"><Button variant="outline" onClick={()=>navigate({to:"/fleet"})}>{language==="de"?"Gesamte Flotte ansehen":"View entire fleet"}<ArrowRight/></Button></div></section>
  <section className="site-shell home-contact"><div><p>{language==="de"?"Persönlicher Service in Dubai":"Personal service in Dubai"}</p><h2>{language==="de"?"Ihr Wunschfahrzeug. Direkt reserviert.":"Your dream car. Booked directly."}</h2></div><Button asChild><Link to="/booking" search={{car:""}}>{language==="de"?"Verfügbarkeit anfragen":"Check availability"}<ArrowRight/></Link></Button></section>
 </div>
}
