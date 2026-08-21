import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/locales";
import { LOCALE_META } from "@/i18n/locales";
import { buildAlternates, ogImages } from "@/lib/i18nSeo";

const SECTION_IDS = [
  "introduction",
  "collection",
  "processing",
  "cookies",
  "thirdParty",
  "rights",
  "changes",
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy.meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("description"),
      url: "/privacy",
      locale: LOCALE_META[locale].ogLocale,
      images: ogImages(locale),
    },
    alternates: buildAlternates("/privacy", locale),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("privacy");

  return (
    <div className="min-h-[70vh] bg-white py-20 px-5 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1
          className="text-[42px] sm:text-[62px] font-medium text-[#1a1a2e] mb-2"
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            letterSpacing: "-3px",
            lineHeight: "1.0",
          }}
        >
          {t("heading")}
        </h1>
        <p className="text-[13px] mb-16 text-[#64748b]">
          {t("lastUpdated")}
        </p>

        <div className="space-y-10">
          {SECTION_IDS.map((id) => (
            <section key={id}>
              <h2 className="text-[18px] font-semibold text-[#1a1a2e] mb-3 tracking-[-0.4px]">
                {t(`sections.${id}.title`)}
              </h2>
              <p className="text-[15px] leading-[1.7] text-[#64748b]">
                {t(`sections.${id}.content`)}
              </p>
            </section>
          ))}

          <section>
            <h2 className="text-[18px] font-semibold text-[#1a1a2e] mb-3 tracking-[-0.4px]">
              {t("contact.title")}
            </h2>
            <p className="text-[15px] leading-[1.7] text-[#64748b]">
              {t.rich("contact.content", {
                mail: (chunks) => (
                  <a
                    href="mailto:support@dottypic.com"
                    className="text-[#C5E89A] hover:text-[#9ED06C] transition-colors"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
