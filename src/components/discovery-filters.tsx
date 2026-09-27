import { Button } from "@/components/ui/button";
import { brandTiles, categoryTiles } from "@/lib/mkr-assets";
import { useLanguage } from "@/lib/language";

export type FleetFilter = { type: "all" | "category" | "brand"; value: string };
export function DiscoveryFilters({ active, onChange }: { active: FleetFilter; onChange: (filter: FleetFilter) => void }) {
 const { language }=useLanguage();
 const selected=(type:FleetFilter["type"],value:string)=>active.type===type&&active.value===value;
 return <div className="discovery-wrap">
  <div className="slider-label"><span>{language==="de"?"Nach Kategorie":"Browse by category"}</span><Button variant="ghost" size="sm" onClick={()=>onChange({type:"all",value:""})}>{language==="de"?"Alle anzeigen":"Show all"}</Button></div>
  <div className="tile-slider category-slider">{categoryTiles.map(item=><Button variant="ghost" key={item.id} className={`discovery-tile category-tile ${selected("category",item.id)?"selected":""}`} onClick={()=>onChange({type:"category",value:item.id})}><img src={item.image} alt=""/><span>{language==="de"?item.de:item.en}</span></Button>)}</div>
  <div className="slider-rule"/>
  <div className="slider-label"><span>{language==="de"?"Nach Marke":"Browse by brand"}</span></div>
  <div className="tile-slider brand-slider">{brandTiles.map(item=><Button variant="ghost" key={item.id} className={`discovery-tile brand-tile ${selected("brand",item.id)?"selected":""}`} onClick={()=>onChange({type:"brand",value:item.id})}><img src={item.image} alt=""/><span>{item.id}</span></Button>)}</div>
 </div>;
}
