import porscheImage from "@/assets/porsche-911.jpg";
import g63Image from "@/assets/mercedes-g63.jpg";
import ferrariImage from "@/assets/ferrari-roma.jpg";
import huracanImage from "@/assets/lamborghini-huracan.jpg";

export const WHATSAPP_NUMBER = "971501234567";
export const PHONE_NUMBER = "+971589278720";
export const whatsappUrl = (message = "Hallo ARDADAGCI, ich möchte ein Luxusfahrzeug in Dubai reservieren.") => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const cars = [
 { slug:"lamborghini-huracan",brand:"Lamborghini",name:"Huracán EVO",category:"Sports",hp:"640 HP",transmission:"Automatik",zeroToHundred:"3,2 s",price:1800,image:huracanImage,color:"Nero Noctis",seats:2,featured:true,noDeposit:true,description:"Ein kompromissloser V10-Supersportwagen für unvergessliche Fahrten durch Dubai." },
 { slug:"ferrari-sf90",brand:"Ferrari",name:"SF90 Stradale",category:"Exotic",hp:"780 HP",transmission:"Automatik",zeroToHundred:"2,5 s",price:2500,image:ferrariImage,color:"Rosso Corsa",seats:2,featured:true,noDeposit:true,description:"Elektrifizierte Ferrari-Performance mit atemberaubender Beschleunigung und italienischer Präsenz." },
 { slug:"mclaren-720s",brand:"McLaren",name:"720S Spider",category:"Convertible",hp:"720 HP",transmission:"Automatik",zeroToHundred:"2,8 s",price:2300,image:porscheImage,color:"Silica White",seats:2,featured:true,noDeposit:true,description:"Leicht, offen und aerodynamisch geformt für ein intensives Fahrerlebnis." },
 { slug:"rolls-royce-cullinan",brand:"Rolls-Royce",name:"Cullinan",category:"Luxury",hp:"571 HP",transmission:"Automatik",zeroToHundred:"5,2 s",price:3500,image:g63Image,color:"Diamond Black",seats:5,featured:true,noDeposit:true,description:"Souveräne Präsenz und kompromissloser Komfort für jede Fahrt in Dubai." },
 { slug:"porsche-911-turbo",brand:"Porsche",name:"911 Turbo S",category:"Sports",hp:"650 HP",transmission:"Automatik",zeroToHundred:"2,7 s",price:1600,image:porscheImage,color:"Carrara White",seats:4,featured:false,noDeposit:true,description:"Alltagstaugliche Präzision mit der Leistung eines echten Supersportwagens." },
 { slug:"mercedes-g63",brand:"Mercedes",name:"AMG G 63",category:"SUV",hp:"585 HP",transmission:"Automatik",zeroToHundred:"4,5 s",price:1900,image:g63Image,color:"Obsidian Black",seats:5,featured:false,noDeposit:true,description:"Ikonisches Design, V8-Leistung und Luxus für Stadt, Wüste und Küste." },
 { slug:"bentley-continental",brand:"Bentley",name:"Continental GT",category:"Luxury",hp:"659 HP",transmission:"Automatik",zeroToHundred:"3,6 s",price:2200,image:ferrariImage,color:"Onyx",seats:4,featured:false,noDeposit:true,description:"Britischer Grand-Touring-Luxus mit beeindruckender Leistung und Ruhe." },
 { slug:"audi-r8",brand:"Audi",name:"R8 V10",category:"Sports",hp:"620 HP",transmission:"Automatik",zeroToHundred:"3,1 s",price:1500,image:huracanImage,color:"Mythos Black",seats:2,featured:false,noDeposit:true,description:"V10-Klang und präzises Handling in einem klar gezeichneten Supersportwagen." },
];

export const reviews=[
 {quote:"Das Fahrzeug war makellos und stand pünktlich vor unserem Hotel. Der gesamte Ablauf war erstklassig.",name:"James R.",location:"London, UK",car:"Porsche 911 Turbo S"},
 {quote:"Transparenter Preis, schnelle Antworten und keinerlei Wartezeit. Genau so sollte Luxusvermietung sein.",name:"Sofia M.",location:"Milan, Italy",car:"Ferrari SF90"},
 {quote:"Von der Lieferung am Flughafen bis zur Abholung wurde alles perfekt organisiert.",name:"Khalid A.",location:"Riyadh, KSA",car:"Mercedes-AMG G 63"},
 {quote:"Der Huracán war in perfektem Zustand. Schneller Kontakt über WhatsApp, ohne versteckte Überraschungen.",name:"Daniel K.",location:"Berlin, Germany",car:"Lamborghini Huracán EVO"},
];
