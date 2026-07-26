import { Bricolage_Grotesque, DM_Mono, DM_Sans } from "next/font/google";

/** Typefaces for the marketing guide pages only. The rest of the site stays on Nunito.
 *
 *  These are deliberately not loaded in the root layout: `next/font` emits the @font-face
 *  rules and preload hints per route that actually renders the component holding the class,
 *  so applying `guideFontClass` on the guide wrapper means `/`, `/faq` and `/contact` never
 *  download them. Header and Footer sit outside that wrapper and keep inheriting
 *  `--font-nunito` from `body`. */

const bricolage = Bricolage_Grotesque({
    variable: "--font-bricolage",
    subsets: ["latin"],
    display: "swap",
});

const dmSans = DM_Sans({
    variable: "--font-dm-sans",
    subsets: ["latin"],
    display: "swap",
});

const dmMono = DM_Mono({
    variable: "--font-dm-mono",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "500"],
});

/** Apply alongside `guide-scope` on the guide page wrapper. */
export const guideFontClass = `${bricolage.variable} ${dmSans.variable} ${dmMono.variable}`;
