import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Gauge, Timer, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { cars } from "@/lib/site-data";
type Car = (typeof cars)[number];
export function CarCard({ car }: { car: Car }) { return <article className="group overflow-hidden border border-border bg-card">
  <Link to="/fleet/$slug" params={{ slug: car.slug }} className="block overflow-hidden bg-secondary"><img src={car.image} alt={`${car.brand} ${car.name}`} width={1408} height={992} loading="lazy" className="aspect-[1.42] w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]" /></Link>
  <div className="p-5 sm:p-6"><p className="eyebrow text-muted-foreground">{car.brand} · {car.category}</p><div className="mt-2 flex items-start justify-between gap-4"><h3 className="font-display text-2xl">{car.name}</h3><p className="shrink-0 text-right text-sm"><span className="text-lg font-semibold">AED {car.price.toLocaleString()}</span><br/><span className="text-muted-foreground">per day</span></p></div>
  <div className="mt-6 grid grid-cols-3 gap-2 border-y border-border py-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Gauge className="size-3.5"/>{car.hp}</span><span className="flex items-center gap-1.5"><Workflow className="size-3.5"/>{car.transmission.split(" ")[0]}</span><span className="flex items-center justify-end gap-1.5"><Timer className="size-3.5"/>{car.zeroToHundred}</span></div>
  <Button asChild variant="outline" size="lg" className="mt-5 w-full justify-between"><Link to="/fleet/$slug" params={{ slug: car.slug }}>Rent now <ArrowUpRight/></Link></Button></div>
</article>; }
