import heroImage from "@/assets/hero-black-lamborghini-dubai.jpg";
import heroImageSmall from "@/assets/hero-black-lamborghini-dubai-960.jpg";

// Visual assets supplied by Masterkey Rent A Car (MKR), downloaded and served from /public.
export const mkrHero = { src: heroImage, small: heroImageSmall };

export const categoryTiles = [
  { id: "Luxury", de: "Luxus", en: "Luxury", image: "/categories/luxury.webp" },
  { id: "Sports", de: "Sportwagen", en: "Sports", image: "/categories/sports.webp" },
  { id: "SUV", de: "SUV", en: "SUV", image: "/categories/suv.webp" },
  { id: "Exotic", de: "Exotisch", en: "Exotic", image: "/categories/exotic.webp" },
  { id: "Convertible", de: "Cabrio", en: "Convertible", image: "/categories/convertible.webp" },
  { id: "Economy", de: "Economy", en: "Economy", image: "/categories/economy.webp" },
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
