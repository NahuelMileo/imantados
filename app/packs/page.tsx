import Link from "next/link";
import Image from "next/image";
import { packs } from "@/lib/packs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Productos — Imantados",
  description:
    "Elige tu pack de imanes personalizados. Packs de 3, 6, 12 y 18 unidades.",
};

export default function PacksPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
        Nuestros productos
      </h1>
      <p className="mt-2 text-muted-foreground">
        Imanes personalizados de 5x5 cm con impresion de alta calidad.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {packs.map((pack) => (
          <Link
            key={pack.id}
            href={`/packs/${pack.id}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
          >
            <div className="relative aspect-square overflow-hidden bg-muted">
              <Image
                src={pack.image}
                alt={pack.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h2 className="text-sm font-semibold text-foreground">
                {pack.name}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {pack.description}
              </p>
              <p className="mt-3 text-lg font-bold text-foreground">
                {"$"}
                {pack.priceUYU.toLocaleString("es-UY")}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  UYU
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
