import heroImage from "@/assets/hero-black-lamborghini-dubai.jpg";
import heroImageSmall from "@/assets/hero-black-lamborghini-dubai-960.jpg";

// Visual assets supplied by Masterkey Rent A Car (MKR) via their CDN.
const CDN = "https://cdn.mkrentacar.com/wp-content/uploads";

export const mkrHero = { src: heroImage, small: heroImageSmall };

export const categoryTiles = [
  { id: "Luxury", de: "Luxus", en: "Luxury", image: `${CDN}/2026/01/luxury-2-1.webp` },
  { id: "Sports", de: "Sportwagen", en: "Sports", image: `${CDN}/2026/01/sport.webp` },
  { id: "SUV", de: "SUV", en: "SUV", image: `${CDN}/2026/01/suv-.webp` },
  { id: "Exotic", de: "Exotisch", en: "Exotic", image: `${CDN}/2026/01/exotic-cars.webp` },
  { id: "Convertible", de: "Cabrio", en: "Convertible", image: `${CDN}/2026/01/convertible-3.webp` },
  { id: "Economy", de: "Economy", en: "Economy", image: `${CDN}/2026/01/economy-1.webp` },
] as const;

export type CategoryId = (typeof categoryTiles)[number]["id"];

// Brand logos: MKR artwork, optimised and served locally so the marquee shows them instantly.
export const brandTiles = [
  { id: "Lamborghini", image: "/brands/lamborghini.webp" },
  { id: "Ferrari", image: "/brands/ferrari.webp" },
  { id: "Rolls-Royce", image: "/brands/rolls-royce.webp" },
  { id: "Bentley", image: "/brands/bentley.webp" },
  { id: "McLaren", image: "/brands/mclaren.webp" },
  { id: "Porsche", image: "/brands/porsche.webp" },
  { id: "Mercedes", image: "/brands/mercedes.webp" },
  { id: "Land Rover", image: "/brands/land-rover.svg" },
  { id: "Audi", image: "/brands/audi.webp" },
  { id: "BMW", image: "/brands/bmw.webp" },
  { id: "Cadillac", image: "/brands/cadillac.webp" },
  { id: "Chevrolet", image: "/brands/chevrolet.svg" },
  { id: "Nissan", image: "/brands/nissan.webp" },
  { id: "GMC", image: "/brands/gmc.webp" },
  { id: "Mini", image: "/brands/mini.webp" },
  { id: "Fiat", image: "/brands/fiat.webp" },
  { id: "Jetour", image: "/brands/jetour.webp" },
  { id: "Ram", image: "/brands/ram.webp" },
  { id: "Infiniti", image: "/brands/infiniti.webp" },
  { id: "Volkswagen", image: "/brands/volkswagen.webp" },
  { id: "Maserati", image: "" },
] as const;
