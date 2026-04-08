"use client"

import * as React from "react"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

const slides = [
  {
    image: "/packs/pack-3.jpg",
    alt: "Heladera decorada con imanes personalizados de fotos familiares",
  },
  {
    image: "/packs/pack-6.webp",
    alt: "Iman personalizado con foto de boda siendo colocado en heladera",
  },
  {
    image: "/packs/pack-12.webp",
    alt: "Caja de regalo con imanes personalizados de fotos de bebe",
  },
  {
    image: "/packs/pack-18.jpg",
    alt: "Imanes corporativos como souvenirs para eventos empresariales",
  },
]

export function HeroCarousel() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <div className="relative w-full">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl md:aspect-21/9">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 border-none bg-background/80 backdrop-blur-sm hover:bg-background/90" />
        <CarouselNext className="right-4 border-none bg-background/80 backdrop-blur-sm hover:bg-background/90" />
      </Carousel>

      {/* Dot indicators */}
      <div className="mt-4 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              current === index
                ? "w-6 bg-foreground"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
