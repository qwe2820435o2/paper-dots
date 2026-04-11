import type { Metadata } from "next";
import HeroSection from "@/components/landing/HeroSection";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CtaSection from "@/components/landing/CtaSection";

const PAGE_TITLE = "Free Dot Image Generator | Automatic Photo Collage Maker with Polka Dot Pattern";
const PAGE_DESCRIPTION =
  "Turn photos into art with our Automatic Photo Collage Maker. Customize your polka dot background with hearts, stars, and dots. Use the best dot image generator for free, no sign-up required!";

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
      <FeatureShowcase
        heading="Experience the Magic of Paper Textures"
        description="Choose from a collection of hand-drawn paper styles that give your photos a tactile, artistic feel. Each texture is carefully crafted to complement different photo styles — from warm kraft paper to elegant parchment. Just pick your favorite and see your photo transform instantly."
        imageSrc="/feature-paper.png"
        imageAlt="Paper texture selection"
        reverse
        blobColor="#B8DB80"
      />
      <FeatureShowcase
        heading="Find the Perfect Dot Pattern"
        description="Fine-tune every detail of your dot decoration. Adjust density, size, and spread to create exactly the look you want. Whether you prefer a subtle scattered effect or bold dotted coverage, the controls are intuitive and the results are always beautiful."
        imageSrc="/feature-dots.png"
        imageAlt="Dot pattern customization"
        blobColor="#E8F5D2"
      />
<FeaturesSection />
      <CtaSection />
    </>
  );
}
