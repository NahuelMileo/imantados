import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { HeroCarousel } from "../HeroCarousel";

function hero() {
  return (
    <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 inline-block rounded-full border border-border px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Imanes personalizados
            </span>
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Tus recuerdos, en imanes premium
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Elegi tu kit, subi tus fotos cuadradas y nosotros hacemos el resto.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-2xl px-8">
                <Link href="/kits">
                  Ver kits
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-2xl px-8"
              >
                <Link href="#como-funciona">Como funciona</Link>
              </Button>
            </div>
          </div>

          {/* Carousel */}
          <div className="mt-12 md:mt-16">
            <HeroCarousel />
          </div>
        </div>
      </section>
  );
}

export default hero;
