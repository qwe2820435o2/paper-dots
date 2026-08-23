import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/locales";
import { LOCALE_META } from "@/i18n/locales";
import { buildAlternates, ogImages } from "@/lib/i18nSeo";

const PROHIBITED_IDS = ["illegal", "reverseEngineer", "scrape"] as const;

const H2_CLASS = "text-[18px] font-semibold text-[#1a1a2e] mb-3 tracking-[-0.4px]";
const BODY_CLASS = "text-[15px] leading-[1.7] text-[#64748b]";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms.meta" });
  const tOg = await getTranslations({ locale, namespace: "og" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("description"),
      url: "/terms",
      type: "website",
      siteName: "Dottypic",
      locale: LOCALE_META[locale].ogLocale,
      images: ogImages(locale, tOg("alt")),
    },
    alternates: buildAlternates("/terms", locale),
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("terms");

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
          <section>
            <h2 className={H2_CLASS}>{t("acceptance.title")}</h2>
            <p className={BODY_CLASS}>{t("acceptance.content")}</p>
          </section>

          <section>
            <h2 className={H2_CLASS}>{t("description.title")}</h2>
            <p className={BODY_CLASS}>{t("description.content")}</p>
          </section>

          <section>
            <h2 className={H2_CLASS}>{t("conduct.title")}</h2>
            <p className="text-[15px] leading-[1.7] mb-4 text-[#64748b]">
              {t("conduct.content")}
            </p>
            <ul className="space-y-3">
              {PROHIBITED_IDS.map((id) => (
                <li
                  key={id}
                  className="flex items-start gap-3 text-[15px] leading-[1.7] text-[#64748b]"
                >
                  <span className="mt-[9px] shrink-0 w-1.5 h-1.5 rounded-full bg-[#C5E89A]/40" />
                  {t(`conduct.prohibited.${id}`)}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className={H2_CLASS}>{t("intellectualProperty.title")}</h2>
            <p className="text-[15px] leading-[1.7] mb-4 text-[#64748b]">
              {t("intellectualProperty.content")}
            </p>
            <p className={BODY_CLASS}>{t("intellectualProperty.content2")}</p>
          </section>

          <section>
            <h2 className={H2_CLASS}>{t("warranties.title")}</h2>
            <p className={BODY_CLASS}>{t("warranties.content")}</p>
          </section>

          <section>
            <h2 className={H2_CLASS}>{t("liability.title")}</h2>
            <p className={BODY_CLASS}>{t("liability.content")}</p>
          </section>

          <section>
            <h2 className={H2_CLASS}>{t("changes.title")}</h2>
            <p className={BODY_CLASS}>{t("changes.content")}</p>
          </section>

          <section>
            <h2 className={H2_CLASS}>{t("contact.title")}</h2>
            <p className={BODY_CLASS}>
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
