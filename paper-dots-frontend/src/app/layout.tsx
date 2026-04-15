import { Nunito } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/common/Providers";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});


import type { Metadata, Viewport } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dottypic.com";
const GA_ID = "G-BWMB2S8Z1N";

const SITE_TITLE = "Free Dot Image Generator | Automatic Photo Collage Maker with Polka Dot Pattern";
const SITE_DESCRIPTION =
  "Turn photos into art with our Automatic Photo Collage Maker. Customize your polka dot background with hearts, stars, and dots. Use the best dot image generator for free, no sign-up required!";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s",
  },
  description: SITE_DESCRIPTION,
  manifest: "/manifest.json",
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "en_US",
    siteName: "Dottypic",
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
      </head>
      <body className={`${nunito.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
