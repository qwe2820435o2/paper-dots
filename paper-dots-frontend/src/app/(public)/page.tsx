import type { Metadata } from "next";
import HeroSection from "@/components/landing/HeroSection";
import FeatureShowcase from "@/components/landing/FeatureShowcase";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WhyLoveSection from "@/components/landing/WhyLoveSection";
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
  name: "Mochipic",
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
        heading="Create Viral Content with our Dot Image Generator"
        description={'Transform your everyday "photo dumps" into curated art. Whether it\'s a weekend recap or a café visit, our tool uses a dot image generator to instantly add that sought-after "Ins-style" atmosphere to your Instagram grid.'}
        imageSrc="/feature-showcase-1.png"
        imageAlt="Create viral content with dot image generator"
        reverse
        blobColor="#C5E89A"
        blendMultiply
      />
      <FeatureShowcase
        heading="Personalized OOTD with an Automatic Photo Collage Maker"
        description="Flaunt your style! Upload your Outfit of the Day, and let our Automatic Photo Collage Maker detect your clothing colors. It creates a matching polka dot background that makes your fashion shots look like a professional magazine spread."
        imageSrc="/feature-showcase-2.png"
        imageAlt="Personalized OOTD with automatic photo collage maker"
        blobColor="#E8F5D2"
        blendMultiply
      />
      <FeatureShowcase
        heading="Aesthetic Edits with Custom Polka Dot Patterns"
        description={'Go beyond the basics. For the ultimate "Soft-girl" or "Coquette" aesthetic, swap standard dots for hearts or stars. Our polka dots pattern options allow you to customize the size and density to match your favorite K-Pop idol or anime fan-art vibes.'}
        imageSrc="/feature-showcase-3.png"
        imageAlt="Aesthetic edits with custom polka dot patterns"
        reverse
        blobColor="#C5E89A"
        blendMultiply
      />
      <FeatureShowcase
        heading="High-Vibe Moodboards featuring Polka Dots Pattern"
        description="Design your dream life. Use a polka dots pattern to tie together travel photos, interior design inspo, or vision boards. Add custom text to capture the mood and save a high-res version perfect for your Pinterest boards."
        imageSrc="/feature-showcase-4.png"
        imageAlt="High-vibe moodboards featuring polka dots pattern"
        blobColor="#E8F5D2"
        blendMultiply
      />
      <FeaturesSection />
      <WhyLoveSection />
      <CtaSection />
    </>
  );
}
