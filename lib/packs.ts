import { Pack } from "./types";

export const packs: Pack[] = [
  {
    id: "pack-3",
    name: "Pack 3 Imanes",
    quantity: 3,
    priceUYU: 390,
    description:
      "Ideal para un regalo especial o para probar nuestros imanes premium.",
    image: "/packs/pack-3.jpg",
    bullets: [
      "3 imanes personalizados de 5x5 cm",
      "Impresion de alta calidad",
      "Recorte 1:1 incluido",
      "Envio o retiro en Chuy",
    ],
  },
  {
    id: "pack-6",
    name: "Pack 6 Imanes",
    quantity: 6,
    priceUYU: 690,
    description:
      "Perfecto para decorar tu heladera con tus mejores recuerdos.",
    image: "/packs/pack-6.webp",
    bullets: [
      "6 imanes personalizados de 5x5 cm",
      "Impresion de alta calidad",
      "Recorte 1:1 incluido",
      "Envio o retiro en Chuy",
    ],
  },
  {
    id: "pack-12",
    name: "Pack 12 Imanes",
    quantity: 12,
    priceUYU: 1190,
    description:  
      "El más vendido. Ideal para quienes quieren mas variedad y aprovechar mejor el precio por unidad.",
    image: "/packs/pack-12.webp",
    bullets: [
      "12 imanes personalizados de 5x5 cm",
      "Impresion de alta calidad",
      "Recorte 1:1 incluido",
      "Mejor precio por unidad",
      "Envio o retiro en Chuy",
    ],
  },
  {
    id: "pack-18",
    name: "Pack 18 Imanes",
    quantity: 18,
    priceUYU: 1690,
    description:
      "Perfecto para armar una coleccion completa o compartir con familia y amigos.",
    image: "/packs/pack-18.jpg",
    bullets: [
      "18 imanes personalizados de 5x5 cm",
      "Impresion de alta calidad",
      "Recorte 1:1 incluido",
      "Ahorro por volumen",
      "Envio o retiro en Chuy",
    ],
  },
];

export function getPack(id: string): Pack | undefined {
  return packs.find((p) => p.id === id);
}