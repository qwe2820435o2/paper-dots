import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/locales";
import { LOCALE_META } from "@/i18n/locales";
import { buildAlternates, ogImages } from "@/lib/i18nSeo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/** Ids double as message keys under `faqPage.items` and as the accordion's values, so they
 *  stay fixed while the copy behind them changes per locale. */
const FAQ_IDS = [
  "free",
  "registration",
  "density",
  "shapes",
  "autoAnalyze",
  "ownBackground",
  "mobile",
  "privacy",
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faqPage.meta" });
  const tOg = await getTranslations({ locale, namespace: "og" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("description"),
      url: "/faq",
      type: "website",
      siteName: "Dottypic",
      locale: LOCALE_META[locale].ogLocale,
      images: ogImages(locale, tOg("alt")),
    },
    alternates: buildAlternates("/faq", locale),
  };
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("faqPage");

  const faqs = FAQ_IDS.map((id) => ({
    id,
    question: t(`items.${id}.question`),
    answer: t(`items.${id}.answer`),
  }));

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="min-h-[70vh] bg-white py-20 px-5 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <h1
          className="text-[42px] sm:text-[62px] font-medium text-[#1a1a2e] mb-4"
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            letterSpacing: "-3px",
            lineHeight: "1.0",
          }}
        >
          {t("heading")}
        </h1>
        <p className="text-[16px] leading-[1.6] mb-14 text-[#64748b]">
          {t("lead")}
        </p>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="border-slate-200"
            >
              <AccordionTrigger
                className="text-left hover:no-underline hover:opacity-80 py-5 text-[15px] font-medium text-[#1a1a2e] tracking-[-0.2px]"
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[15px] leading-[1.7] text-[#64748b]">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
