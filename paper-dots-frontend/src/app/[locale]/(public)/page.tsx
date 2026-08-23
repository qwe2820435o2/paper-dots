import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { guideFontClass } from "@/lib/fonts";
import type { GuideFaqItem } from "@/content/guides";
import type { AppLocale } from "@/i18n/locales";
import { LOCALE_META } from "@/i18n/locales";
import { buildAlternates, ogImages } from "@/lib/i18nSeo";
import GuideRail from "@/components/guide/GuideRail";
import GuideFaq from "@/components/guide/GuideFaq";
import GuideFinalCta from "@/components/guide/GuideFinalCta";
import HomeHero from "@/components/landing/HomeHero";
import HomeToolGrid from "@/components/landing/HomeToolGrid";
import HomeColorEngine from "@/components/landing/HomeColorEngine";
import HomeWhy from "@/components/landing/HomeWhy";
import HomeReviews from "@/components/landing/HomeReviews";
import Reveal from "@/components/landing/Reveal";

/** Ids double as message keys under `home.faq.items` and as the accordion's React keys, so
 *  they must not change when copy does. */
const FAQ_IDS = [
  "free",
  "watermark",
  "account",
  "experience",
  "audience",
  "whatToMake",
  "sizes",
  "commercial",
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: "/",
      type: "website",
      siteName: "Dottypic",
      locale: LOCALE_META[locale].ogLocale,
      images: ogImages(locale, t("ogImageAlt")),
    },
    alternates: buildAlternates("/", locale),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");

  const faqItems: GuideFaqItem[] = FAQ_IDS.map((id) => ({
    id,
    question: t(`faq.items.${id}.question`),
    answer: t(`faq.items.${id}.answer`),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Dottypic",
    description: t("meta.description"),
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    browserRequirements: "Requires a modern browser",
  };

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
          <Reveal>
            <GuideFaq faq={{ heading: t("faq.heading"), items: faqItems }} />
          </Reveal>
        </div>
        <Reveal>
          <GuideFinalCta
            finalCta={{
              heading: t("finalCta.heading"),
              body: t("finalCta.body"),
              cta: { text: t("finalCta.cta"), href: null },
            }}
            appPath="/create/dot"
            uploadToDot
          />
        </Reveal>
      </div>
    </>
  );
}
