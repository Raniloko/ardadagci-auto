import fleet from "./mkr-fleet.json";
import { brandTiles, categoryTiles, type CategoryId } from "./mkr-assets";
import type { Photo } from "./images";
import { customerPriceEur, feeEur } from "./pricing";

export const WHATSAPP_NUMBER = "971501234567";
export const PHONE_NUMBER = "+971589278720";
export const EMAIL = "hello@ardadagci.com";
export const whatsappUrl = (message = "Hallo ARDADAGCI, ich möchte ein Luxusfahrzeug in Dubai reservieren.") => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

type FleetRecord = (typeof fleet)[number];

export type Car = Omit<FleetRecord, "category" | "extraKmAed" | "source" | "images"> & {
  category: CategoryId;
  /** Customer daily price in EUR (MKR price + ARDADAGCI markup). */
  price: number;
  /** Original image URLs (lightbox, social previews). */
  images: string[];
  image: string;
  /** Gallery with resized variants for responsive loading. */
  photos: Photo[];
  extraKmEur: number | null;
  featured: boolean;
};

// Hand-picked highlights shown first on the homepage and in the default fleet order.
const FEATURED = [
  "lamborghini-revuelto", "ferrari-sf-90", "rolls-royce-cullinan-mansory-kit", "lamborghini-urus-performante",
  "mclaren-720s-spider", "porsche-gt3-rs", "mercedes-g63-keyvany", "rolls-royce-spectre",
  "ferrari-purosangue", "lamborghini-huracan-sto", "bentley-continental-gt", "range-rover-vogue",
];

export const cars: Car[] = fleet
  .map(({ extraKmAed, source: _source, ...car }) => ({
    ...car,
    category: car.category as CategoryId,
    price: customerPriceEur(car.baseDailyAed, car.slug),
    images: car.images.map((photo) => photo.src),
    image: car.images[0]?.src ?? "",
    photos: car.images,
    extraKmEur: extraKmAed ? feeEur(extraKmAed) : null,
    featured: FEATURED.includes(car.slug),
  }))
  .sort((a, b) => Number(b.featured) - Number(a.featured) || (a.featured ? FEATURED.indexOf(a.slug) - FEATURED.indexOf(b.slug) : b.price - a.price));

export const featuredCars = FEATURED.map((slug) => cars.find((car) => car.slug === slug)).filter((car): car is Car => Boolean(car));

export const findCar = (slug: string) => cars.find((car) => car.slug === slug);

export const brands = brandTiles
  .map((brand) => ({ ...brand, count: cars.filter((car) => car.brand === brand.id).length }))
  .filter((brand) => brand.count > 0);

export const categories = categoryTiles.map((category) => {
  const inCategory = cars.filter((car) => car.category === category.id);
  return { ...category, count: inCategory.length, fromPrice: Math.min(...inCategory.map((car) => car.price)) };
});

export const carTitle = (car: Pick<Car, "brand" | "name">) => `${car.brand} ${car.name}`;

const COLORS_DE: Record<string, string> = {
  black: "Schwarz", white: "Weiß", grey: "Grau", gray: "Grau", blue: "Blau", green: "Grün", red: "Rot", yellow: "Gelb",
  purple: "Lila", violet: "Violett", silver: "Silber", brown: "Braun", mate: "Matt", matte: "Matt", offwhite: "Cremeweiß",
};
export const colorLabel = (color: string | null, language: "de" | "en") =>
  !color ? "–" : language === "en" ? color : color.split(/(\s|\/)/).map((part) => COLORS_DE[part.toLowerCase()] ?? part).join("");

export const categoryLabel = (id: string, language: "de" | "en") => {
  const tile = categoryTiles.find((category) => category.id === id);
  return tile ? tile[language] : id;
};

/** Short bilingual intro generated from the vehicle specs. */
export function carSummary(car: Car, language: "de" | "en") {
  const title = carTitle(car);
  if (language === "de") {
    return [
      `Mieten Sie den ${title}${car.color ? ` in ${colorLabel(car.color, "de")}` : ""} in Dubai`,
      car.engine ? ` – ${car.engine}-Motor${car.drive ? `, ${car.drive}-Antrieb` : ""}` : "",
      car.zeroToHundred ? ` und 0–100 km/h in ${String(car.zeroToHundred).replace(".", ",")} Sekunden` : "",
      `. ${car.deposit === "none" ? "Ohne Kaution, " : ""}inklusive ${car.mileageLimitKm ?? 250} km pro Tag und Lieferung zu Ihrem Hotel, Ihrer Residenz oder zum Flughafen.`,
    ].join("");
  }
  return [
    `Rent the ${title}${car.color ? ` in ${car.color.toLowerCase()}` : ""} in Dubai`,
    car.engine ? ` – ${car.engine} engine${car.drive ? `, ${car.drive}` : ""}` : "",
    car.zeroToHundred ? ` and 0–100 km/h in ${car.zeroToHundred} seconds` : "",
    `. ${car.deposit === "none" ? "No deposit, " : ""}${car.mileageLimitKm ?? 250} km per day included and delivery to your hotel, residence or the airport.`,
  ].join("");
}

export const fleetStats = { cars: cars.length, brands: brands.length, fromPrice: Math.min(...cars.map((car) => car.price)) };

export const reviews = [
  { quote: "Das Fahrzeug war makellos und stand pünktlich vor unserem Hotel. Der gesamte Ablauf war erstklassig.", name: "James R.", location: "London, UK", car: "Porsche 911 Turbo S" },
  { quote: "Transparenter Preis, schnelle Antworten und keinerlei Wartezeit. Genau so sollte Luxusvermietung sein.", name: "Sofia M.", location: "Milan, Italy", car: "Ferrari SF90" },
  { quote: "Von der Lieferung am Flughafen bis zur Abholung wurde alles perfekt organisiert.", name: "Khalid A.", location: "Riyadh, KSA", car: "Mercedes-AMG G 63" },
  { quote: "Der Huracán war in perfektem Zustand. Schneller Kontakt über WhatsApp, ohne versteckte Überraschungen.", name: "Daniel K.", location: "Berlin, Germany", car: "Lamborghini Huracán EVO" },
];
