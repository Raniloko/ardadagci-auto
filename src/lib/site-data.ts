import heroImage from "@/assets/hero-lamborghini-dubai.jpg";
import porscheImage from "@/assets/porsche-911.jpg";
import g63Image from "@/assets/mercedes-g63.jpg";
import ferrariImage from "@/assets/ferrari-roma.jpg";
import huracanImage from "@/assets/lamborghini-huracan.jpg";

export const WHATSAPP_NUMBER = "971501234567";
export const whatsappUrl = (message = "Hello ARDADAGCI, I would like to book a luxury car in Dubai.") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const cars = [
  { slug: "lamborghini-huracan-evo", brand: "Lamborghini", name: "Huracán EVO", category: "Supercar", hp: "640 HP", transmission: "7-speed DCT", zeroToHundred: "2.9 sec", price: 3900, image: huracanImage, color: "Arancio Borealis", seats: 2, featured: true, description: "A naturally aspirated V10 icon, tuned for the city and alive on every open road." },
  { slug: "porsche-911-turbo-s", brand: "Porsche", name: "911 Turbo S", category: "Sports", hp: "650 HP", transmission: "8-speed PDK", zeroToHundred: "2.7 sec", price: 3200, image: porscheImage, color: "Jet Black", seats: 4, featured: true, description: "Quietly devastating performance with the composure to make every Dubai mile effortless." },
  { slug: "mercedes-amg-g63", brand: "Mercedes-AMG", name: "G 63", category: "SUV", hp: "585 HP", transmission: "9-speed Auto", zeroToHundred: "4.4 sec", price: 2800, image: g63Image, color: "Polar White", seats: 5, featured: true, description: "Unmistakable presence, handcrafted V8 power, and first-class comfort for every passenger." },
  { slug: "ferrari-roma", brand: "Ferrari", name: "Roma", category: "Grand Tourer", hp: "620 HP", transmission: "8-speed DCT", zeroToHundred: "3.4 sec", price: 4200, image: ferrariImage, color: "Argento Nürburgring", seats: 4, featured: true, description: "Contemporary Italian elegance with a front-mid-engine V8 and beautifully measured drama." },
];

export const reviews = [
  { quote: "The car arrived at our hotel exactly on time and looked flawless. The entire experience felt genuinely five-star.", name: "James R.", location: "London, UK", car: "Porsche 911 Turbo S" },
  { quote: "Transparent price, quick replies, and no waiting around. Arda made our anniversary weekend unforgettable.", name: "Sofia M.", location: "Milan, Italy", car: "Ferrari Roma" },
  { quote: "From airport delivery to collection, everything was handled with care. This is how luxury rental should work.", name: "Khalid A.", location: "Riyadh, KSA", car: "Mercedes-AMG G 63" },
  { quote: "The Huracán was immaculate. Fast communication on WhatsApp and absolutely no hidden surprises.", name: "Daniel K.", location: "Berlin, Germany", car: "Lamborghini Huracán EVO" },
];

export { heroImage };
