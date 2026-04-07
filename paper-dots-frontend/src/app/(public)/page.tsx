import type { Metadata } from "next";
import HeroSection from "@/components/landing/HeroSection";

const PAGE_TITLE = "Paper Dots";
const PAGE_DESCRIPTION =
  "A tiny black-and-white tool to decorate your photos with hand-drawn paper textures and scattered dots.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Paper Dots",
  description: PAGE_DESCRIPTION,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  browserRequirements: "Requires a modern browser",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
    </>
  );
}
