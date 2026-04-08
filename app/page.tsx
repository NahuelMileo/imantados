import Link from "next/link";
import { HowItWorks } from "@/components/home/how-it-works";
import { PacksGrid } from "@/components/home/pack-grid";
import { Gallery } from "@/components/home/gallery";
import { Testimonials } from "@/components/home/testimonials";
import { FAQ } from "@/components/home/faq";
import Hero from "@/components/home/hero";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <PacksGrid />
      {/* <Gallery /> */}
      <Testimonials />
      <FAQ />
    </>
  );
}
