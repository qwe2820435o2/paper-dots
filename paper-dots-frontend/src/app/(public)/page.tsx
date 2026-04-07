import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/components/landing/HeroSection";

// TODO: replace with real Paper Dots SEO title/description
const PAGE_TITLE = "Paper Dots";
const PAGE_DESCRIPTION = "TODO: Paper Dots product description";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/",
  },
};

const HowItWorksSection = dynamic(() => import("@/components/landing/HowItWorksSection"), {
  loading: () => <div className="h-64" />,
});
const FeaturesSection = dynamic(() => import("@/components/landing/FeaturesSection"), {
  loading: () => <div className="h-64" />,
});
const ShowcaseSection = dynamic(() => import("@/components/landing/ShowcaseSection"), {
  loading: () => <div className="h-96" />,
});


// TODO: replace with real Paper Dots structured data (name, url, description)
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Paper Dots",
      url: "https://paperdots.example.com",
      description: "TODO: Paper Dots product description",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      browserRequirements: "Requires a modern browser",
    },
    {
      "@type": "Organization",
      name: "Paper Dots",
      url: "https://paperdots.example.com",
      logo: "https://paperdots.example.com/icon.png",
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ShowcaseSection />
    </>
  );
}
