import { createFileRoute } from "@tanstack/react-router";
import { Search, PhoneCall } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "VIP Rent A Car | Sports & Luxury Car Rental Dubai" }, { name: "description", content: "Sports and luxury car rental in Dubai since 2000." }] }),
  component: HomePage,
});

function HomePage() {
  return <div className="vip-home">
    <section className="vip-hero">
      <div className="vip-hero-overlay" />
      <div className="vip-hero-content">
        <h1>VIP CAR RENTAL DUBAI</h1>
        <p>UAE - SINCE 2000</p>
        <label className="vip-hero-search"><Search className="size-4" /><input aria-label="Search by make or model" placeholder="Search by make or model" /></label>
      </div>
      <a href="tel:+971589278720" className="vip-float-call" aria-label="Call VIP Rent a Car"><PhoneCall className="size-7" /></a>
    </section>
    <section className="vip-placeholder-section"><h2>BROWSE BY TYPE</h2><div className="vip-type-grid">{["SPORTS CARS", "LUXURY CARS", "SUV CARS", "MONTHLY CARS", "7 SEATER CARS", "LUXURY VAN", "CHAUFFEUR SERVICE", "MODIFIED CARS", "BUDGET CARS", "CONVERTIBLE CARS"].map((type, i) => <article key={type}><div className={`vip-type-image vip-type-${i + 1}`} /><h3>{type}</h3><span>{[42,61,98,63,28,6,12,26,8,20][i]} Cars</span></article>)}</div></section>
  </div>;
}
