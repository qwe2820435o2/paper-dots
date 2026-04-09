import type { Metadata } from "next";
import HeroSection from "@/components/landing/HeroSection";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import StylesGrid from "@/components/landing/StylesGrid";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CtaSection from "@/components/landing/CtaSection";

const PAGE_TITLE = "Paper Dots";
const PAGE_DESCRIPTION =
  "A free online tool to decorate your photos with hand-drawn paper textures and scattered dots.";

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
        heading="The Best Free Online Photo Decorator"
        description="Whether you're creating art prints, personalizing gifts, or just having fun, Paper Dots makes it easy to transform any photo into a unique dotted masterpiece. Upload your image, choose a paper texture, and watch the magic happen — all in your browser, completely free."
        imageSrc="/hero-booth.webp"
        imageAlt="Paper Dots collage maker interface"
        blobColor="#EDE9FE"
      />
      <FeatureShowcase
        heading="Experience the Magic of Paper Textures"
        description="Choose from a collection of hand-drawn paper styles that give your photos a tactile, artistic feel. Each texture is carefully crafted to complement different photo styles — from warm kraft paper to elegant parchment. Just pick your favorite and see your photo transform instantly."
        imageSrc="/hero-booth.webp"
        imageAlt="Paper texture selection"
        reverse
        blobColor="#CCFBF1"
      />
      <FeatureShowcase
        heading="Find the Perfect Dot Pattern"
        description="Fine-tune every detail of your dot decoration. Adjust density, size, and spread to create exactly the look you want. Whether you prefer a subtle scattered effect or bold dotted coverage, the controls are intuitive and the results are always beautiful."
        imageSrc="/hero-booth.webp"
        imageAlt="Dot pattern customization"
        blobColor="#FEF3C7"
      />
      <StylesGrid />
      <FeaturesSection />
      <CtaSection />
    </>
  );
}
