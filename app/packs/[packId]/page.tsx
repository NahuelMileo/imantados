import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { packs, getPack } from "@/lib/packs";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, Truck, ShieldCheck, Printer } from "lucide-react";
import type { Metadata } from "next";

export function generateStaticParams() {
  return packs.map((k) => ({ packId: k.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ packId: string }>;
}): Promise<Metadata> {
  const { packId } = await params;
  const pack = getPack(packId);
  return {
    title: pack ? `${pack.name} — Imantados` : "Pack no encontrado",
    description: pack?.description,
  };
}

export default async function PackDetailPage({
  params,
}: {
  params: Promise<{ packId: string }>;
}) {
  const { packId } = await params;
  const pack = getPack(packId);
  if (!pack) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 md:py-16">
      <Link
        href="/packs"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Volver a productos
      </Link>

      {/* Product layout */}
      <div className="grid gap-10 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
          <Image
            src={pack.image}
            alt={pack.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {pack.quantity} imanes
          </span>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl text-balance">
            {pack.name}
          </h1>

          <p className="mt-3 text-4xl font-bold text-foreground">
            {"$"}
            {pack.priceUYU.toLocaleString("es-UY")}
            <span className="ml-1 text-base font-normal text-muted-foreground">
              UYU
            </span>
          </p>

          <p className="mt-4 leading-relaxed text-muted-foreground">
            {pack.description}
          </p>

          <ul className="mt-6 flex flex-col gap-2.5">
            {pack.bullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2.5 text-sm text-muted-foreground"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
                {b}
              </li>
            ))}
          </ul>

          <Button asChild size="lg" className="mt-8 rounded-xl">
            <Link href={`/pedido?pack=${pack.id}`}>Empezar pedido</Link>
          </Button>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Printer className="size-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Alta calidad
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Truck className="size-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Envio o retiro
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <ShieldCheck className="size-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Pago seguro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Extra info */}
      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground">
            Recomendaciones de fotos
          </h3>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm leading-relaxed text-muted-foreground">
            <li>Fotos cuadradas funcionan mejor.</li>
            <li>Podes recortar cada imagen antes de confirmar tu pedido.</li>
            <li>
              Usa fotos de buena resolucion para la mejor calidad de impresion.
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground">
            Necesitas otra cantidad?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Para pedidos personalizados o eventos especiales, contactanos
            directamente y te armamos un presupuesto a medida.
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-4 rounded-xl"
          >
            <Link href="/contacto">Contactanos</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
