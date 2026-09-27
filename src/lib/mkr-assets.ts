import hero from "@/assets/mkr/hero-ferrari.png.asset.json";
import luxury from "@/assets/mkr/category-luxury.webp.asset.json";
import sports from "@/assets/mkr/category-sports.webp.asset.json";
import suv from "@/assets/mkr/category-suv.webp.asset.json";
import exotic from "@/assets/mkr/category-exotic.webp.asset.json";
import convertible from "@/assets/mkr/category-convertible.webp.asset.json";
import economy from "@/assets/mkr/category-economy.webp.asset.json";
import lamborghini from "@/assets/mkr/brand-lamborghini.webp.asset.json";
import bentley from "@/assets/mkr/brand-bentley.webp.asset.json";
import ferrari from "@/assets/mkr/brand-ferrari.webp.asset.json";
import rollsRoyce from "@/assets/mkr/brand-rolls-royce.webp.asset.json";
import porsche from "@/assets/mkr/brand-porsche.webp.asset.json";
import mercedes from "@/assets/mkr/brand-mercedes.webp.asset.json";
import audi from "@/assets/mkr/brand-audi.webp.asset.json";
import bmw from "@/assets/mkr/brand-bmw.webp.asset.json";
import mclaren from "@/assets/mkr/brand-mclaren.webp.asset.json";

export const mkrHero = hero.url;
export const categoryTiles = [
  { id: "Luxury", de: "Luxury", en: "Luxury", image: luxury.url },
  { id: "Sports", de: "Sportwagen", en: "Sports", image: sports.url },
  { id: "SUV", de: "SUV", en: "SUV", image: suv.url },
  { id: "Exotic", de: "Exotisch", en: "Exotic", image: exotic.url },
  { id: "Convertible", de: "Cabrio", en: "Convertible", image: convertible.url },
  { id: "Economy", de: "Economy", en: "Economy", image: economy.url },
] as const;
export const brandTiles = [
  { id: "Lamborghini", image: lamborghini.url }, { id: "Bentley", image: bentley.url },
  { id: "Ferrari", image: ferrari.url }, { id: "Rolls-Royce", image: rollsRoyce.url },
  { id: "Porsche", image: porsche.url }, { id: "Mercedes", image: mercedes.url },
  { id: "Audi", image: audi.url }, { id: "BMW", image: bmw.url }, { id: "McLaren", image: mclaren.url },
] as const;
