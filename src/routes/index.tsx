import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, ChevronRight, MapPin } from "lucide-react";
import { cars, reviews, whatsappUrl } from "@/lib/site-data";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "ARDADAGCI | Dubai Car Rental" }, { name: "description", content: "A considered collection of exceptional cars for Dubai." }] }),
  component: HomePage,
});

function HomePage() {
  return <div className="arda-site"><SiteHeader />
    <main>
      <section className="arda-hero">
        <div className="hero-copy"><p className="eyebrow">DUBAI / UAE — 25°12′N 55°16′E</p><h1>Drive<br /><em>different.</em></h1><p className="hero-intro">An exceptional collection of cars for the city that never settles. Delivered to your door, ready when you are.</p><div className="hero-actions"><Link className="button button-dark" to="/fleet">Explore the fleet <ArrowUpRight size={16} /></Link><a className="text-link" href={whatsappUrl()}>Book on WhatsApp <ChevronRight size={15} /></a></div></div>
        <div className="hero-art"><div className="hero-image" /><div className="hero-stamp">ARD<br />ADAGCI</div><span className="hero-index">01 <i>/</i> 03</span></div>
      </section>
      <section className="marquee"><span>SUPERCARS</span><span>SPORTS CARS</span><span>PREMIUM SUV</span><span>DUBAI DELIVERY</span></section>
      <section className="fleet-section section-wrap"><div className="section-heading"><div><p className="eyebrow">THE COLLECTION</p><h2>Made for <em>moments.</em></h2></div><Link className="text-link" to="/fleet">View all cars <ArrowUpRight size={15} /></Link></div><div className="car-grid">{cars.map((car, i) => <article className="car-card" key={car.slug}><div className="car-visual"><img src={car.image} alt={`${car.brand} ${car.name}`} /><span>0{i + 1}</span></div><div className="car-info"><p className="eyebrow">{car.category}</p><h3>{car.brand} <strong>{car.name}</strong></h3><div className="car-specs"><span>{car.hp}</span><span>{car.transmission}</span><span>0–100 {car.zeroToHundred}</span></div><div className="car-foot"><p>From <b>AED {car.price.toLocaleString()}</b> / day</p><Link to="/booking" search={{ car: car.slug }} aria-label={`Rent ${car.brand} ${car.name}`}><ArrowUpRight size={17} /></Link></div></div></article>)}</div></section>
      <section className="manifesto section-wrap"><div className="manifesto-number">01</div><div><p className="eyebrow">THE ARDADAGCI STANDARD</p><h2>Not just a rental.<br /><em>A point of view.</em></h2></div><div className="manifesto-copy"><p>We believe the right car changes the way a city feels. That is why every detail — from the first message to the final mile — is designed around your experience.</p><div className="feature-list"><span><Check size={15} /> Door-to-door delivery</span><span><Check size={15} /> Fully insured</span><span><Check size={15} /> Personal concierge</span></div></div></section>
      <section className="experience section-wrap"><div className="experience-image"><img src="/vip-hero-interior.png" alt="Luxury car interior in Dubai" /></div><div className="experience-copy"><p className="eyebrow">THE EXPERIENCE</p><h2>Dubai,<br /><em>your way.</em></h2><p>Morning meetings in Downtown. Sunset on Jumeirah. A late-night drive with the skyline in your mirrors. Wherever the day takes you, arrive differently.</p><Link className="button button-light" to="/about">Our story <ArrowUpRight size={16} /></Link></div></section>
      <section className="reviews section-wrap"><div className="section-heading"><div><p className="eyebrow">IN THEIR WORDS</p><h2>Good company.</h2></div><div className="review-stars">★★★★★</div></div><div className="review-grid">{reviews.slice(0,3).map((review) => <blockquote key={review.name}><div className="stars">★★★★★</div><p>“{review.quote}”</p><footer><strong>{review.name}</strong><span>{review.location}</span></footer></blockquote>)}</div></section>
      <section className="closing-cta"><p className="eyebrow">READY WHEN YOU ARE</p><h2>Choose your<br /><em>next drive.</em></h2><a className="button button-light" href={whatsappUrl("Hello ARDADAGCI, I would like to book a car.")}>Start a conversation <ArrowUpRight size={16} /></a></section>
    </main><footer className="arda-footer"><img src="/ardadagci-logo.png" alt="Ardadagci Dubai Car Rental" /><span>© 2026 ARDADAGCI</span><span><MapPin size={14} /> Dubai, UAE</span></footer>
  </div>;
}
export default HomePage;

