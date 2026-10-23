import fleet from "./mkr-fleet.json";
import { brandTiles, categoryTiles, type CategoryId } from "./mkr-assets";
import type { Photo } from "./images";
import { customerPriceAed, type PricingSettings } from "./pricing";
import { DEFAULT_CONFIG, type SiteConfig, type SiteSettings } from "./site-config";

type FleetRecord = (typeof fleet)[number];

export type Car = Omit<FleetRecord, "category" | "source" | "images"> & {
  category: CategoryId;
  /** MKR model name before any admin override. */
  originalName: string;
  /** Customer daily price in AED (admin override, or MKR price + markup). */
  price: number;
  /** Price from the formula, ignoring a manual override. */
  formulaPrice: number;
  priceOverridden: boolean;
  /** Original image URLs (lightbox, social previews). */
  images: string[];
  image: string;
  /** Gallery with resized variants for responsive loading. */
  photos: Photo[];
  featured: boolean;
  /** Removed from the website by the admin. */
  hidden: boolean;
  /** false = currently rented out ("Derzeit vermietet"). */
  available: boolean;
  descriptionDe: string | null;
  descriptionEn: string | null;
};

// Hand-picked highlights shown first on the homepage and in the default fleet order (admin can change per car).
export const DEFAULT_FEATURED = [
  "lamborghini-revuelto", "ferrari-sf-90", "rolls-royce-cullinan-mansory-kit", "lamborghini-urus-performante",
  "mclaren-720s-spider", "porsche-gt3-rs", "mercedes-g63-keyvany", "rolls-royce-spectre",
  "ferrari-purosangue", "lamborghini-huracan-sto", "bentley-continental-gt", "range-rover-vogue",
];

const CATEGORY_IDS = categoryTiles.map((category) => category.id) as string[];

/** All imported vehicles (before admin overrides). */
export const baseFleet = fleet;

function buildCars(config: SiteConfig): Car[] {
  const pricing: PricingSettings = config.settings;
  return fleet
    .map(({ source: _source, ...car }) => {
      const override = config.overrides[car.slug];
      const formulaPrice = customerPriceAed(car.baseDailyAed, pricing);
      return {
        ...car,
        originalName: car.name,
        name: override?.name || car.name,
        category: (override?.category && CATEGORY_IDS.includes(override.category) ? override.category : car.category) as CategoryId,
        mileageLimitKm: override?.mileageLimitKm ?? car.mileageLimitKm,
        price: override?.priceAed ?? formulaPrice,
        formulaPrice,
        priceOverridden: Boolean(override?.priceAed),
        images: car.images.map((photo) => photo.src),
        image: car.images[0]?.src ?? "",
        photos: car.images,
        featured: override?.featured ?? DEFAULT_FEATURED.includes(car.slug),
        hidden: override?.hidden ?? false,
        available: override?.available ?? true,
        descriptionDe: override?.descriptionDe || null,
        descriptionEn: override?.descriptionEn || null,
      };
    })
    // Highlights first, then by price; colour variants of the same model stay next to each other.
    .sort((a, b) => {
      const rank = (car: Car) => (DEFAULT_FEATURED.includes(car.slug) ? DEFAULT_FEATURED.indexOf(car.slug) : DEFAULT_FEATURED.length);
      return Number(b.featured) - Number(a.featured) ||
        (a.featured && b.featured ? rank(a) - rank(b) || b.price - a.price : b.price - a.price) ||
        `${a.brand} ${a.name} ${a.color ?? ""}`.localeCompare(`${b.brand} ${b.name} ${b.color ?? ""}`);
    });
}

export type Fleet = ReturnType<typeof buildFleet>;

/** The public fleet with all admin changes applied. Hidden cars are excluded everywhere except `all`. */
export function buildFleet(config: SiteConfig = DEFAULT_CONFIG) {
  const all = buildCars(config);
  const cars = all.filter((car) => !car.hidden);
  const brands = brandTiles
    .map((brand) => ({ ...brand, count: cars.filter((car) => car.brand === brand.id).length }))
    .filter((brand) => brand.count > 0);
  const categories = categoryTiles.map((category) => {
    const inCategory = cars.filter((car) => car.category === category.id);
    return { ...category, count: inCategory.length, fromPrice: inCategory.length ? Math.min(...inCategory.map((car) => car.price)) : 0 };
  });
  return {
    all,
    cars,
    featuredCars: cars.filter((car) => car.featured),
    findCar: (slug: string) => cars.find((car) => car.slug === slug),
    brands,
    categories,
    fleetStats: { cars: cars.length, brands: brands.length, fromPrice: cars.length ? Math.min(...cars.map((car) => car.price)) : 0 },
  };
}

export type Contact = ReturnType<typeof buildContact>;

/** Contact details from the admin settings. */
export function buildContact(settings: SiteSettings) {
  const tiktokHandle = settings.tiktokUrl.match(/@[\w.]+/)?.[0] ?? "TikTok";
  return {
    whatsappUrl: (message = "Hallo ARDADAGCI, ich möchte ein Luxusfahrzeug in Dubai reservieren.") => `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`,
    phoneNumber: settings.phoneNumber.replace(/\s+/g, ""),
    phoneDisplay: formatPhone(settings.phoneNumber),
    email: settings.email,
    tiktokUrl: settings.tiktokUrl,
    tiktokHandle,
  };
}

/** "+491726023003" → "+49 172 6023003" (keeps numbers that already contain spaces). */
export function formatPhone(phone: string) {
  if (/\s/.test(phone.trim())) return phone.trim();
  const match = phone.match(/^\+(49|971|43|41)(\d{2,3})(\d+)$/);
  return match ? `+${match[1]} ${match[2]} ${match[3]}` : phone;
}

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

export const reviews = [
  { quote: "Das Fahrzeug war makellos und stand pünktlich vor unserem Hotel. Der gesamte Ablauf war erstklassig.", name: "James R.", location: "London, UK", car: "Porsche 911 Turbo S" },
  { quote: "Transparenter Preis, schnelle Antworten und keinerlei Wartezeit. Genau so sollte Luxusvermietung sein.", name: "Sofia M.", location: "Milan, Italy", car: "Ferrari SF90" },
  { quote: "Von der Lieferung am Flughafen bis zur Abholung wurde alles perfekt organisiert.", name: "Khalid A.", location: "Riyadh, KSA", car: "Mercedes-AMG G 63" },
  { quote: "Der Huracán war in perfektem Zustand. Schneller Kontakt über WhatsApp, ohne versteckte Überraschungen.", name: "Daniel K.", location: "Berlin, Germany", car: "Lamborghini Huracán EVO" },
];
