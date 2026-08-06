import type { Metadata } from "next";
import { guideFontClass } from "@/lib/fonts";
import type { GuideFaqItem } from "@/content/guides";
import GuideRail from "@/components/guide/GuideRail";
import GuideFaq from "@/components/guide/GuideFaq";
import GuideFinalCta from "@/components/guide/GuideFinalCta";
import HomeHero from "@/components/landing/HomeHero";
import HomeToolGrid from "@/components/landing/HomeToolGrid";
import HomeColorEngine from "@/components/landing/HomeColorEngine";
import HomeWhy from "@/components/landing/HomeWhy";
import HomeReviews from "@/components/landing/HomeReviews";

const PAGE_TITLE = "DottyPic: Free Aesthetic Photo Editor for Everyone";
const PAGE_DESCRIPTION =
  "DottyPic is a free aesthetic photo editor with small, easy tools for quote posts, overlays, and patterned backgrounds. No skills needed, no watermark, no sign up.";

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
  name: "Dottypic",
  description: PAGE_DESCRIPTION,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  browserRequirements: "Requires a modern browser",
};

const FAQ_ITEMS: GuideFaqItem[] = [
  {
    id: "free",
    question: "Is DottyPic free?",
    answer:
      "Yes, completely. Every tool, every shape, and every export size is free. There is no paid tier and no trial that runs out on you.",
  },
  {
    id: "watermark",
    question: "Do you add a watermark to my image?",
    answer:
      "No. Anything you export comes out clean, with no DottyPic logo anywhere on it. You can post it or use it however you want.",
  },
  {
    id: "account",
    question: "Do I need an account to use DottyPic?",
    answer:
      "No. There is no sign up and no email required. Open any tool on the site and you can start working straight away.",
  },
  {
    id: "experience",
    question: "Do I need any editing experience?",
    answer:
      "No. DottyPic was built for people who have never edited a photo. There are no layers, no masks, and no color picker you have to get right. Upload something, move a slider or two if you feel like it, and download.",
  },
  {
    id: "audience",
    question: "Is DottyPic for designers or for beginners?",
    answer:
      "Both, but mostly beginners. Most people here just want a post that looks put together without opening Photoshop. Designers use it too, usually to grab a quick background or overlay instead of building one from scratch.",
  },
  {
    id: "what-to-make",
    question: "What can I make with DottyPic?",
    answer:
      "Quote posts with a matching color block, photos with snowflake or heart overlays, polka dot backgrounds, and geometric patterns. People use them for Instagram posts and stories, slide decks, phone wallpapers, and small business graphics.",
  },
  {
    id: "sizes",
    question: "What sizes can I export?",
    answer:
      "Instagram posts and stories, 16:9 slides, phone wallpapers, and custom dimensions. Everything exports as PNG, with a 2x option when you need it sharper.",
  },
  {
    id: "commercial",
    question: "Can I use what I make commercially?",
    answer:
      "Yes. Anything you make with DottyPic is yours to use, including for client work and for products you sell. The only thing you cannot do is resell the tools themselves.",
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={`${guideFontClass} guide-scope`}>
        <HomeHero />
        <GuideRail />
        <HomeToolGrid />
        <HomeColorEngine />
        <HomeWhy />
        <HomeReviews />
        <div id="faq" className="scroll-mt-20">
          <GuideFaq faq={{ heading: "FAQs", items: FAQ_ITEMS }} />
        </div>
        <GuideFinalCta
          finalCta={{
            heading: "Go make something",
            body: "Pick a tool, drop in a photo, see what comes out. Free, no watermark, no sign up.",
            cta: { text: "Upload a photo", href: null },
          }}
          appPath="/create/polka-dot"
        />
      </div>
    </>
  );
}
