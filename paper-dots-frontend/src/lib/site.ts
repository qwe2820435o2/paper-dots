/** Single source for the production site origin, previously duplicated across layout.tsx,
 *  sitemap.ts and robots.ts. opengraph-image.tsx keeps its own fallback on purpose — it needs
 *  an absolute, reachable URL at request time, and falling back to the production domain
 *  there would silently fetch the deployed OG assets instead of local ones during dev. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dottypic.com";
