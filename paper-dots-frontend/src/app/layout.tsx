import { Inter, Space_Grotesk, Azeret_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/common/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const azeretMono = Azeret_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

import type { Metadata } from "next";

// TODO: replace with real paper-dots domain
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paperdots.example.com";
// TODO: replace with paper-dots Google Analytics id
const GA_ID = "G-XXXXXXXXXX";

const SITE_TITLE = "Paper Dots";
const SITE_DESCRIPTION =
  "A tiny black-and-white tool to decorate your photos with hand-drawn paper textures and scattered dots.";

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
    siteName: "Paper Dots",
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
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${azeretMono.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
