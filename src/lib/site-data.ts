import heroImage from "@/assets/hero-black-lamborghini-dubai.jpg";
import porscheImage from "@/assets/porsche-911.jpg";
import g63Image from "@/assets/mercedes-g63.jpg";
import ferrariImage from "@/assets/ferrari-roma.jpg";
import huracanImage from "@/assets/lamborghini-huracan.jpg";

export const WHATSAPP_NUMBER = "971501234567";
export const whatsappUrl = (message = "Hello ARDADAGCI, I would like to book a luxury car in Dubai.") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const cars = [
  { slug: "lamborghini-huracan", brand: "Lamborghini", name: "Huracán", category: "Supercar", hp: "640 HP", transmission: "Automatic", zeroToHundred: "3.2s", price: 1800, image: huracanImage, color: "Arancio Borealis", seats: 2, featured: true, description: "A naturally aspirated V10 icon, tuned for the city and alive on every open road." },
  { slug: "ferrari-sf90", brand: "Ferrari", name: "SF90", category: "Supercar", hp: "780 HP", transmission: "Automatic", zeroToHundred: "2.5s", price: 2500, image: ferrariImage, color: "Rosso Corsa", seats: 2, featured: true, description: "Electrified Ferrari performance with breathtaking pace and unmistakable Italian presence." },
  { slug: "mclaren-720s", brand: "McLaren", name: "720S", category: "Supercar", hp: "720 HP", transmission: "Automatic", zeroToHundred: "2.8s", price: 2300, image: porscheImage, color: "Silica White", seats: 2, featured: true, description: "A lightweight supercar shaped by aerodynamics and engineered for effortless speed." },
  { slug: "rolls-royce-cullinan", brand: "Rolls-Royce", name: "Cullinan", category: "Luxury SUV", hp: "571 HP", transmission: "Automatic", zeroToHundred: "5.2s", price: 3500, image: g63Image, color: "Diamond Black", seats: 5, featured: true, description: "Commanding presence, serene comfort, and uncompromising luxury for every Dubai journey." },
];

export const reviews = [
  { quote: "The car arrived at our hotel exactly on time and looked flawless. The entire experience felt genuinely five-star.", name: "James R.", location: "London, UK", car: "Porsche 911 Turbo S" },
  { quote: "Transparent price, quick replies, and no waiting around. Arda made our anniversary weekend unforgettable.", name: "Sofia M.", location: "Milan, Italy", car: "Ferrari Roma" },
  { quote: "From airport delivery to collection, everything was handled with care. This is how luxury rental should work.", name: "Khalid A.", location: "Riyadh, KSA", car: "Mercedes-AMG G 63" },
  { quote: "The Huracán was immaculate. Fast communication on WhatsApp and absolutely no hidden surprises.", name: "Daniel K.", location: "Berlin, Germany", car: "Lamborghini Huracán EVO" },
];

export { heroImage };
