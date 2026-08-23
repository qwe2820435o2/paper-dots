import { Nunito } from "next/font/google";
import Script from "next/script";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/common/Providers";
import { SITE_URL } from "@/lib/site";
import { routing } from "@/i18n/routing";
import { LOCALE_META, type AppLocale } from "@/i18n/locales";
import { buildAlternates, ogImages } from "@/lib/i18nSeo";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});


import type { Metadata, Viewport } from "next";

const GA_ID = "G-BWMB2S8Z1N";
const DISABLE_INDEXING = process.env.DISABLE_INDEXING === "true";

const SITE_TITLE = "Free Dot Image Generator | Automatic Photo Collage Maker with Polka Dot Pattern";
const SITE_DESCRIPTION =
  "Turn photos into art with our Automatic Photo Collage Maker. Customize your polka dot background with hearts, stars, and dots. Use the best dot image generator for free, no sign-up required!";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

/** Prerenders all three locales at build time. Without it every page falls back to dynamic
 *  rendering, because `setRequestLocale` reads from the request. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "og" });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_TITLE,
      template: "%s",
    },
    description: SITE_DESCRIPTION,
    manifest: "/manifest.json",
    // Inherited by any page that does not export its own `alternates`; the editor pages
    // override it with a self-canonical + noindex.
    alternates: buildAlternates("/", locale),
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      type: "website",
      locale: LOCALE_META[locale].ogLocale,
      siteName: "Dottypic",
      url: "/",
      images: ogImages(locale, t("alt")),
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: ogImages(locale, t("alt")).map((image) => image.url),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={LOCALE_META[locale].htmlLang}>
      <head>
        {!DISABLE_INDEXING && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${nunito.variable} antialiased`}>
        <NextIntlClientProvider>
          <Providers>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
