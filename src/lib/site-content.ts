// Bilingual marketing and service copy, adapted from the Masterkey Rent A Car partner content.
type Bilingual = { de: string; en: string };

export const features: { icon: "shield" | "clock" | "car" | "sparkles" | "card" | "tag" | "truck" | "star"; title: Bilingual; text: Bilingual }[] = [
  { icon: "shield", title: { de: "Ohne Kaution", en: "No deposit" }, text: { de: "Reservieren ohne Sicherheitsleistung – keine Blockierung auf Ihrer Kreditkarte.", en: "Book with zero security deposit – no hold on your card." } },
  { icon: "clock", title: { de: "24/7 Support", en: "24/7 support" }, text: { de: "Rund um die Uhr erreichbar – für Buchung, Fragen und Hilfe unterwegs.", en: "Round-the-clock help for bookings, questions and on-road assistance." } },
  { icon: "car", title: { de: "175+ Fahrzeuge", en: "175+ cars" }, text: { de: "Eine der größten Flotten Dubais – von Economy bis Hypercar.", en: "One of Dubai's largest fleets – from economy to hypercar." } },
  { icon: "sparkles", title: { de: "Top-Zustand", en: "Excellent condition" }, text: { de: "Gereinigt, gewartet und vor jeder Übergabe geprüft.", en: "Cleaned, serviced and inspected before every handover." } },
  { icon: "card", title: { de: "Flexible Zahlung", en: "Flexible payment" }, text: { de: "Karte, Überweisung, Bar oder Krypto – wie es Ihnen passt.", en: "Card, bank transfer, cash or crypto – your choice." } },
  { icon: "tag", title: { de: "Transparente Preise", en: "Transparent prices" }, text: { de: "Tages-, Wochen- und Monatsmiete ohne versteckte Kosten.", en: "Daily, weekly and monthly rates without hidden costs." } },
  { icon: "truck", title: { de: "Lieferung in Dubai", en: "Delivery in Dubai" }, text: { de: "Wir bringen das Auto zu Hotel, Residenz oder Flughafen.", en: "We deliver to your hotel, residence or the airport." } },
  { icon: "star", title: { de: "Deutscher Ansprechpartner", en: "German-speaking service" }, text: { de: "Persönliche Beratung auf Deutsch – von der Anfrage bis zur Rückgabe.", en: "Personal advice in German and English – from request to return." } },
];

export const steps: { title: Bilingual; text: Bilingual }[] = [
  { title: { de: "Fahrzeug wählen", en: "Select a car" }, text: { de: "Wählen Sie Ihr Traumauto aus über 175 Fahrzeugen.", en: "Choose your dream car from 175+ vehicles." } },
  { title: { de: "Anfragen", en: "Request" }, text: { de: "Per WhatsApp oder kurzem Formular – in unter einer Minute.", en: "Via WhatsApp or a short form – in under a minute." } },
  { title: { de: "Bestätigen", en: "Confirm" }, text: { de: "Wir bestätigen Verfügbarkeit, Preis und Lieferzeit persönlich.", en: "We confirm availability, price and delivery time personally." } },
  { title: { de: "Losfahren", en: "Drive" }, text: { de: "Das Auto wird geliefert. Rückgabe mit gleichem Tankstand.", en: "The car is delivered. Return it with the same fuel level." } },
];

export const documents = {
  tourists: { title: { de: "Für Touristen", en: "For tourists" }, items: [{ de: "Reisepass", en: "Passport" }, { de: "Führerschein des Heimatlandes", en: "Home country driving licence" }, { de: "Internationaler Führerschein (IDP), falls erforderlich", en: "International Driving Permit (IDP), if required" }] },
  residents: { title: { de: "Für Einwohner der VAE", en: "For UAE residents" }, items: [{ de: "VAE-Führerschein", en: "UAE driving licence" }, { de: "Emirates ID (UAE Pass möglich)", en: "Emirates ID (UAE Pass may be accepted)" }] },
};

export const rentalTerms: { label: Bilingual; value: Bilingual }[] = [
  { label: { de: "Mindestalter", en: "Minimum age" }, value: { de: "18 Jahre – Fahrer von 18 bis 23 Jahren hinterlegen eine erstattbare Kaution", en: "18 years – drivers aged 18–23 pay a refundable deposit" } },
  { label: { de: "Tankregelung", en: "Fuel policy" }, value: { de: "Rückgabe mit dem gleichen Tankstand wie bei Übergabe", en: "Return with the same fuel level as at delivery" } },
  { label: { de: "Salik (Maut)", en: "Salik (tolls)" }, value: { de: "AED 6–8 zzgl. MwSt. pro Durchfahrt, Abrechnung am Mietende", en: "AED 6–8 + VAT per crossing, settled at the end of the rental" } },
  { label: { de: "Zahlung", en: "Payment" }, value: { de: "Karte, Bar, Überweisung oder Krypto", en: "Card, cash, bank transfer or crypto" } },
  { label: { de: "Kautionsrückzahlung", en: "Deposit refund" }, value: { de: "Falls Kaution anfällt: Rückzahlung innerhalb von 10 Werktagen", en: "If a deposit applies: refunded within 10 working days" } },
];

export const locations = [
  "Dubai Airport (DXB)", "Palm Jumeirah", "Dubai Marina", "Downtown Dubai", "Business Bay", "JBR", "JLT", "Dubai Mall",
  "Mall of the Emirates", "Sheikh Zayed Road", "Dubai Hills", "Bluewater Island", "Al Barsha", "Bur Dubai", "Al Quoz", "JVC",
  "Silicon Oasis", "Al Karama", "Satwa", "Abu Dhabi", "Sharjah", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain",
];

export const brandStories: { brand: string; title: Bilingual; text: Bilingual }[] = [
  { brand: "Lamborghini", title: { de: "Lamborghini mieten in Dubai", en: "Rent a Lamborghini in Dubai" }, text: { de: "Spüren Sie das Brüllen eines italienischen V10 und V12. Huracán, Urus, Aventador und Revuelto – gebaut für alle, die rohe Geschwindigkeit, präzises Handling und eine Präsenz suchen, die auf der Sheikh Zayed Road jeden Blick fängt.", en: "Feel the roar of an Italian V10 and V12. Huracán, Urus, Aventador and Revuelto – built for drivers who want raw speed, sharp handling and a presence that turns heads on Sheikh Zayed Road." } },
  { brand: "Rolls-Royce", title: { de: "Rolls-Royce mieten in Dubai", en: "Rent a Rolls-Royce in Dubai" }, text: { de: "Für Hochzeiten, große Auftritte oder den ersten Eindruck, der für sich spricht: Cullinan, Ghost, Phantom und Spectre bieten handgefertigte Interieurs und eine Ruhe, die man nur von Rolls-Royce kennt.", en: "For weddings, red-carpet arrivals or a first impression that speaks for itself: Cullinan, Ghost, Phantom and Spectre deliver hand-crafted interiors and a calm only Rolls-Royce knows." } },
  { brand: "Ferrari", title: { de: "Ferrari mieten in Dubai", en: "Rent a Ferrari in Dubai" }, text: { de: "Vom SF90 über den 812 bis zum Purosangue: Rennsport-Performance für Stadt und Highway – für ein Wochenende, einen besonderen Anlass oder einfach das Gefühl, eine italienische Ikone zu fahren.", en: "From SF90 to 812 and Purosangue: race-derived performance for city and highway – for a weekend escape, a special occasion or simply the thrill of an Italian icon." } },
  { brand: "Bentley", title: { de: "Bentley mieten in Dubai", en: "Rent a Bentley in Dubai" }, text: { de: "Bentayga, Continental GT und Flying Spur verbinden kraftvolle Motoren mit einem großzügigen First-Class-Interieur – ideal für Business, Flughafentransfers und Events.", en: "Bentayga, Continental GT and Flying Spur pair powerful engines with a spacious first-class cabin – ideal for business, airport transfers and events." } },
  { brand: "McLaren", title: { de: "McLaren mieten in Dubai", en: "Rent a McLaren in Dubai" }, text: { de: "Artura, 570S und 720S: britische Ingenieurskunst mit Hybrid-Antrieb und Rennsport-Aerodynamik für die offenen Straßen Dubais.", en: "Artura, 570S and 720S: British engineering with hybrid power and race-inspired aerodynamics for Dubai's open roads." } },
];

export const faqGroups: { title: Bilingual; items: { q: Bilingual; a: Bilingual }[] }[] = [
  {
    title: { de: "Kilometer, Maut & Grenzen", en: "Mileage, tolls & limits" },
    items: [
      { q: { de: "Gibt es ein tägliches Kilometerlimit?", en: "Is there a daily mileage limit?" }, a: { de: "Jede Miete enthält in der Regel 250 km pro Tag – genug für Stadt und Ausflüge. Planen Sie längere Strecken, sagen Sie uns vorher Bescheid und wir richten Zusatzkilometer ein.", en: "Each rental usually includes 250 km per day – plenty for city and intercity driving. If you plan longer distances, tell us in advance and we'll arrange extra mileage." } },
      { q: { de: "Darf ich nach Abu Dhabi oder in andere Emirate fahren?", en: "Can I drive to Abu Dhabi or other Emirates?" }, a: { de: "Ja – innerhalb der VAE dürfen Sie überall fahren, inklusive Abu Dhabi, Sharjah, Ras Al Khaimah und Fujairah. Salik-Gebühren und eventuelle Strafzettel werden am Ende abgerechnet.", en: "Yes – you can drive anywhere within the UAE, including Abu Dhabi, Sharjah, Ras Al Khaimah and Fujairah. Salik tolls and any fines are settled at the end." } },
      { q: { de: "Kann ich mit dem Mietwagen in den Oman fahren?", en: "Can I take the car to Oman?" }, a: { de: "Grenzüberschreitende Fahrten benötigen eine vorherige Genehmigung und eine zusätzliche Versicherung, die wir für ausgewählte Fahrzeuge organisieren können.", en: "Cross-border trips need advance approval and extra insurance, which we can arrange for selected cars." } },
      { q: { de: "Wie werden Strafzettel behandelt?", en: "How are traffic fines handled?" }, a: { de: "Bußgelder während der Mietzeit werden Ihnen am Ende der Buchung berechnet. Wir zeigen Ihnen vorher immer die Details.", en: "Fines registered during your rental are billed at the end of your booking. We always show you the details first." } },
    ],
  },
  {
    title: { de: "Führerschein & Voraussetzungen", en: "Licence & eligibility" },
    items: [
      { q: { de: "Brauche ich einen internationalen Führerschein?", en: "Do I need an International Driving Permit?" }, a: { de: "Mit einem deutschen, österreichischen oder Schweizer Führerschein können Touristen in der Regel ohne IDP fahren. Bei anderen Ländern prüfen wir das gerne für Sie.", en: "Visitors from many countries (UK, US, most of Europe) can usually drive on their home licence. For other countries we'll check for you." } },
      { q: { de: "Kann ich unter 25 Jahren mieten?", en: "Can I rent under 25?" }, a: { de: "Ja – viele Fahrzeuge sind ab 18 bzw. 21 Jahren verfügbar. Für einige Supersportwagen gilt ein höheres Mindestalter. Fahrer zwischen 18 und 23 hinterlegen eine erstattbare Kaution.", en: "Yes – many cars are available from 18 or 21. Some supercars have a higher minimum age. Drivers aged 18–23 pay a refundable deposit." } },
    ],
  },
  {
    title: { de: "Buchung, Zahlung & Storno", en: "Booking, payment & cancellation" },
    items: [
      { q: { de: "Kann ich kurzfristig für denselben Tag buchen?", en: "Can I book for the same day?" }, a: { de: "In den meisten Fällen ja – schreiben Sie uns Wunschfahrzeug und Standort, und wir sagen Ihnen, wie schnell das Auto bei Ihnen ist.", en: "In most cases yes – message us the car and your location, and we'll tell you how quickly it can be with you." } },
      { q: { de: "Welche Zahlungsarten akzeptieren Sie?", en: "Which payment methods do you accept?" }, a: { de: "Kreditkarte, Überweisung, Bargeld und Krypto. Teilen Sie uns Ihre bevorzugte Methode mit.", en: "Credit card, bank transfer, cash and crypto. Tell us your preferred method." } },
      { q: { de: "Wie sind die Stornobedingungen?", en: "What is the cancellation policy?" }, a: { de: "Sagen Sie uns so früh wie möglich Bescheid, wenn sich Ihre Pläne ändern. Die genauen Bedingungen hängen von Fahrzeug und Zeitpunkt ab – wir erklären sie vor der Buchung transparent.", en: "Let us know as early as possible if your plans change. Exact terms depend on car and timing – we explain them clearly before you commit." } },
      { q: { de: "Gibt es eine Mindestmietdauer?", en: "Is there a minimum rental period?" }, a: { de: "Die Standardmiete ist tageweise. Je länger Sie mieten, desto günstiger wird der Tagespreis.", en: "Standard rental is daily. The longer you book, the lower your daily rate." } },
    ],
  },
  {
    title: { de: "Versicherung & Extras", en: "Insurance & extras" },
    items: [
      { q: { de: "Ist eine Versicherung inklusive?", en: "Is insurance included?" }, a: { de: "Alle Fahrzeuge sind basisversichert. Auf Wunsch erweitern wir den Schutz, um Ihre Selbstbeteiligung zu reduzieren oder auszuschließen.", en: "All cars come with basic insurance. On request we add enhanced cover that reduces or removes your excess." } },
      { q: { de: "Was mache ich bei einem Unfall oder einer Panne?", en: "What if I have an accident or breakdown?" }, a: { de: "Bringen Sie sich in Sicherheit, rufen Sie bei Schäden die Polizei für einen Bericht und kontaktieren Sie uns sofort – wir sind 24/7 erreichbar.", en: "Stay safe, call the police for a report if there is damage and contact us immediately – we're available 24/7." } },
      { q: { de: "Bieten Sie Kindersitze oder einen Chauffeur an?", en: "Do you offer child seats or a chauffeur?" }, a: { de: "Ja – Kindersitz, GPS und Chauffeur-Service können auf Anfrage hinzugebucht werden.", en: "Yes – child seats, GPS and chauffeur service can be added on request." } },
      { q: { de: "Bieten Sie Monats- oder Langzeitmieten an?", en: "Do you offer monthly rentals?" }, a: { de: "Ja – Monatsmieten bieten deutlich reduzierte Tagespreise. Wartung und Service übernehmen wir. Fragen Sie nach einem Angebot.", en: "Yes – monthly rentals come with sharply reduced daily rates. Maintenance is handled by us. Ask for a quote." } },
    ],
  },
];

/** MKR delivery fees in AED (shown to customers converted to EUR). */
export const deliveryFees: { label: Bilingual; aed: number }[] = [
  { label: { de: "Innerhalb Dubai – Lieferung + Abholung", en: "Within Dubai – delivery + pick-up" }, aed: 100 },
  { label: { de: "Innerhalb Dubai – nur Lieferung oder Abholung", en: "Within Dubai – delivery or pick-up only" }, aed: 50 },
  { label: { de: "Al Maktoum Airport, Sharjah Airport, Sharjah City (einfach)", en: "Al Maktoum Airport, Sharjah Airport, Sharjah City (one-way)" }, aed: 200 },
  { label: { de: "Ajman, Abu Dhabi Airport, Al Ain, Fujairah, Ras Al Khaimah (einfach)", en: "Ajman, Abu Dhabi Airport, Al Ain, Fujairah, Ras Al Khaimah (one-way)" }, aed: 1000 },
];
