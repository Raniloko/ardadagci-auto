import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CarCard } from "@/components/car-card";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { cars } from "@/lib/site-data";
export const Route=createFileRoute("/fleet")({head:()=>({meta:[{title:"Luxury Fleet — ARDADAGCI Dubai"},{name:"description",content:"Explore supercars, sports cars, grand tourers and luxury SUVs available for rental in Dubai."},{property:"og:title",content:"Luxury Fleet — ARDADAGCI Dubai"},{property:"og:description",content:"A handpicked luxury fleet, delivered anywhere in Dubai."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:FleetPage});
function FleetPage(){const [filter,setFilter]=useState("All"); const categories=["All",...new Set(cars.map(c=>c.category))]; const shown=filter==="All"?cars:cars.filter(c=>c.category===filter); return <><PageIntro eyebrow="The collection" title="Find your drive." copy="Every vehicle is maintained without compromise and arrives detailed, fuelled, and ready."/><section className="site-shell pb-24"><div className="flex flex-wrap gap-2 border-y border-border py-5">{categories.map(c=><Button key={c} variant={filter===c?"default":"outline"} size="sm" onClick={()=>setFilter(c)}>{c}</Button>)}</div><p className="my-8 text-sm text-muted-foreground">{shown.length} vehicles available</p><div className="grid gap-5 md:grid-cols-2">{shown.map(c=><CarCard key={c.slug} car={c}/>)}</div></section></>}
