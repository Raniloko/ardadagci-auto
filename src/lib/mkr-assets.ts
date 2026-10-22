import heroImage from "@/assets/hero-black-lamborghini-dubai.jpg";

// Visual assets supplied by Masterkey Rent A Car (MKR) via their CDN.
const CDN = "https://cdn.mkrentacar.com/wp-content/uploads";

export const mkrHero = heroImage;

export const categoryTiles = [
  { id: "Luxury", de: "Luxus", en: "Luxury", image: `${CDN}/2026/01/luxury-2-1.webp` },
  { id: "Sports", de: "Sportwagen", en: "Sports", image: `${CDN}/2026/01/sport.webp` },
  { id: "SUV", de: "SUV", en: "SUV", image: `${CDN}/2026/01/suv-.webp` },
  { id: "Exotic", de: "Exotisch", en: "Exotic", image: `${CDN}/2026/01/exotic-cars.webp` },
  { id: "Convertible", de: "Cabrio", en: "Convertible", image: `${CDN}/2026/01/convertible-3.webp` },
  { id: "Economy", de: "Economy", en: "Economy", image: `${CDN}/2026/01/economy-1.webp` },
] as const;

export type CategoryId = (typeof categoryTiles)[number]["id"];

export const brandTiles = [
  { id: "Lamborghini", image: `${CDN}/2025/07/lamborghini-1.png` },
  { id: "Ferrari", image: `${CDN}/2025/07/ferrari-1.png` },
  { id: "Rolls-Royce", image: `${CDN}/2025/07/cdrp0674jG-1.png` },
  { id: "Bentley", image: `${CDN}/2025/03/1unVcJlu27-1.png` },
  { id: "McLaren", image: `${CDN}/2025/05/1000215839.png` },
  { id: "Porsche", image: `${CDN}/2025/07/porsche-1.png` },
  { id: "Mercedes", image: `${CDN}/2025/07/mercedes-1.png` },
  { id: "Land Rover", image: `${CDN}/2025/05/range-rover.svg` },
  { id: "Audi", image: `${CDN}/2025/07/audi-1.png` },
  { id: "BMW", image: `${CDN}/2025/07/bmw-1.png` },
  { id: "Cadillac", image: `${CDN}/2025/07/Mcu96Jz47.png` },
  { id: "Chevrolet", image: `${CDN}/2025/05/chevrolet-1.svg` },
  { id: "Nissan", image: `${CDN}/2025/07/nissan-1.png` },
  { id: "GMC", image: `${CDN}/2025/03/44hLtSMJuT.png` },
  { id: "Mini", image: `${CDN}/2025/05/1000215855.png` },
  { id: "Fiat", image: `${CDN}/2025/07/3tf1g9Pzjs.png` },
  { id: "Jetour", image: `${CDN}/2025/03/uJjLh6LZkw.png` },
  { id: "Ram", image: `${CDN}/2025/11/Ram-Logo-1993-removebg-preview-1.png` },
  { id: "Infiniti", image: `${CDN}/2025/11/png-transparent-infiniti-car-nissan-symbol-brand-fiat-angle-emblem-trademark-removebg-preview.png` },
  { id: "Volkswagen", image: `${CDN}/2025/11/images__7_-removebg-preview.png` },
  { id: "Maserati", image: "" },
] as const;
