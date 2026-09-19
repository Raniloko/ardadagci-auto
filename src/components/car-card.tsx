import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Gauge, Timer, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { cars } from "@/lib/site-data";
type Car = (typeof cars)[number];
export function CarCard({ car }: { car: Car }) { return <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg">
  <Link to="/fleet/$slug" params={{ slug: car.slug }} className="block overflow-hidden bg-secondary"><img src={car.image} alt={`${car.brand} ${car.name}`} width={1408} height={992} loading="lazy" className="aspect-[1.48] w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" /></Link>
  <div className="p-4"><h3 className="font-display text-base font-semibold">{car.brand} {car.name}</h3>
  <div className="mt-3 grid gap-1.5 text-[.68rem] text-muted-foreground"><span className="flex items-center gap-2"><Gauge className="size-3.5"/>{car.hp}</span><span className="flex items-center gap-2"><Workflow className="size-3.5"/>{car.transmission}</span><span className="flex items-center gap-2"><Timer className="size-3.5"/>0–100 km/h {car.zeroToHundred}</span></div>
  <p className="mt-4 text-xs">From <span className="font-semibold">{car.price.toLocaleString("en-US")} AED</span> / day</p>
  <Button asChild size="sm" className="mt-4 w-full justify-center rounded-md normal-case"><Link to="/fleet/$slug" params={{ slug: car.slug }}>Rent Now <ArrowUpRight/></Link></Button></div>
</article>; }
