import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail } from "lucide-react";
import type { AppLocale } from "@/i18n/locales";
import { LOCALE_META } from "@/i18n/locales";
import { buildAlternates, ogImages } from "@/lib/i18nSeo";
import { guideFontClass } from "@/lib/fonts";
import { GUIDE_WRAP, GUIDE_SEC_HEAD } from "@/components/guide/guideLayout";
import { HOME_H2_STYLE } from "@/components/landing/homeLayout";
import Reveal from "@/components/landing/Reveal";
import GuideRail from "@/components/guide/GuideRail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact.meta" });
  const tOg = await getTranslations({ locale, namespace: "og" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: "/contact",
      type: "website",
      siteName: "Dottypic",
      locale: LOCALE_META[locale].ogLocale,
      images: ogImages(locale, tOg("alt")),
    },
    alternates: buildAlternates("/contact", locale),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");

  const mailto = `mailto:${t("getInTouch.email")}`;

  return (
    <div className={`${guideFontClass} guide-scope`}>
      <section className="pb-16 pt-24 text-center">
        <div className={`${GUIDE_WRAP} ${GUIDE_SEC_HEAD} mx-auto`}>
          <Reveal>
            <h1 style={{ fontSize: "clamp(38px, 4.5vw, 58px)" }}>{t("hero.headline")}</h1>
            <p className="mx-auto mt-5 max-w-[52ch] text-lg text-guide-ink-2">{t("hero.subheadline")}</p>
          </Reveal>
        </div>
      </section>

      <GuideRail />

      <section className="py-20 text-center">
        <div className={`${GUIDE_WRAP} ${GUIDE_SEC_HEAD} mx-auto`}>
          <Reveal>
            <h2 style={HOME_H2_STYLE}>{t("about.heading")}</h2>
            <div aria-hidden className="mx-auto mt-5 flex items-center justify-center gap-2">
              <span className="h-[9px] w-[9px] rounded-full border-[1.5px] border-guide-edge-strong bg-guide-lime" />
              <span className="h-[9px] w-[9px] rounded-full border-[1.5px] border-[#e0447a] bg-guide-pop" />
              <span className="h-[9px] w-[9px] rounded-full border-[1.5px] border-guide-ink bg-guide-ink" />
            </div>
            <div className="mt-8 space-y-5 text-left text-[15.5px] leading-[1.7] text-guide-ink-2">
              <p>{t("about.paragraph1")}</p>
              <p>{t("about.paragraph2")}</p>
              <p>{t("about.paragraph3")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-guide-edge bg-guide-lime-3 py-20">
        <div className={GUIDE_WRAP}>
          <Reveal>
            <div className="mx-auto max-w-[560px] rounded-[36px] border-[1.5px] border-guide-edge-strong bg-white px-10 py-14 text-center shadow-guide">
              <h2 style={HOME_H2_STYLE}>{t("getInTouch.heading")}</h2>
              <p className="mx-auto mt-4 max-w-[46ch] text-[15.5px] leading-[1.6] text-guide-ink-2">
                {t("getInTouch.intro")}
              </p>

              <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-guide border-[1.5px] border-guide-edge bg-guide-lime-3 px-6 py-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white">
                  <Mail className="h-4 w-4 text-guide-ink" strokeWidth={1.8} />
                </span>
                <div className="text-left">
                  <div className="guide-mono text-xs text-guide-mute">{t("getInTouch.emailLabel")}</div>
                  <div className="text-[15px] font-semibold text-guide-ink">{t("getInTouch.email")}</div>
                </div>
              </div>

              <div className="mt-8">
                <a href={mailto} className="guide-btn">
                  {t("cta.button")}
                </a>
              </div>

              <p className="mx-auto mt-6 max-w-[46ch] text-xs leading-[1.6] text-guide-mute">
                {t("getInTouch.note")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
