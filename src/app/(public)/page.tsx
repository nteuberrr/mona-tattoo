import { Hero } from "@/components/marketing/Hero";
import { Gallery } from "@/components/marketing/Gallery";
import { HowToBook } from "@/components/marketing/HowToBook";
import { About } from "@/components/marketing/About";
import { Guidelines } from "@/components/marketing/Guidelines";
import { Pricing } from "@/components/marketing/Pricing";
import { FAQ } from "@/components/marketing/FAQ";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Gallery />
      <HowToBook />
      <About />
      <Guidelines />
      <Pricing />
      <FAQ />
    </>
  );
}
