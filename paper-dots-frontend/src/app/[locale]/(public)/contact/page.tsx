import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, MessageSquare } from "lucide-react";
import type { AppLocale } from "@/i18n/locales";
import { LOCALE_META } from "@/i18n/locales";
import { buildAlternates, ogImages } from "@/lib/i18nSeo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact.meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: "/contact",
      locale: LOCALE_META[locale].ogLocale,
      images: ogImages(locale),
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

  return (
    <div className="min-h-[70vh] bg-white py-20 px-5 sm:px-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-green-50">
              <Mail className="w-4 h-4 text-[#C5E89A]" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-1 tracking-[-0.2px]">
                {t("email.title")}
              </h2>
              <p className="text-[14px] leading-[1.6] mb-3 text-[#64748b]">
                {t("email.body")}
              </p>
              <a
                href="mailto:support@dottypic.com"
                className="text-[14px] font-medium text-[#C5E89A] hover:text-[#9ED06C] transition-colors"
              >
                support@dottypic.com
              </a>
            </div>
          </div>

          {/* Feedback */}
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-green-50">
              <MessageSquare className="w-4 h-4 text-[#C5E89A]" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-1 tracking-[-0.2px]">
                {t("feedback.title")}
              </h2>
              <p className="text-[14px] leading-[1.6] text-[#64748b]">
                {t("feedback.body")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
