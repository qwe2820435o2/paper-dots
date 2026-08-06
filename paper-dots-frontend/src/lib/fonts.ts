import { Bricolage_Grotesque, DM_Mono, DM_Sans } from "next/font/google";

/** Typefaces for the marketing guide pages and the homepage. The rest of the site stays on
 *  Nunito.
 *
 *  These are deliberately not loaded in the root layout: `next/font` emits the @font-face
 *  rules and preload hints per route that actually renders the component holding the class,
 *  so applying `guideFontClass` only on the guide wrapper and the homepage means `/faq` and
 *  `/contact` never download them. Header and Footer sit outside that wrapper and keep
 *  inheriting `--font-nunito` from `body`. */

/** Both carry a variable optical-size (`opsz`) axis — the mockup's Google Fonts link requests
 *  it explicitly (`opsz,wght@12..96,...`), so headline-size text renders at the bolder, chunkier
 *  "display" cut. next/font only fetches the axes you ask for, so without this the opsz axis
 *  sits at its default (a lighter, text-size cut) regardless of font-size. */
const bricolage = Bricolage_Grotesque({
    variable: "--font-bricolage",
    subsets: ["latin"],
    display: "swap",
    axes: ["opsz"],
});

const dmSans = DM_Sans({
    variable: "--font-dm-sans",
    subsets: ["latin"],
    display: "swap",
    axes: ["opsz"],
});

const dmMono = DM_Mono({
    variable: "--font-dm-mono",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "500"],
});

/** Apply alongside `guide-scope` on the guide page wrapper. */
export const guideFontClass = `${bricolage.variable} ${dmSans.variable} ${dmMono.variable}`;
