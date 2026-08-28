import type { AppLocale } from "@/i18n/locales";

/** The blog's content source. WordPress runs headless on Railway and renders no front end of its
 *  own — this constant is the only place its origin is named, so moving the CMS is one env var. */
const WP_API =
    process.env.WORDPRESS_API_URL ?? "https://wordpress-dot.up.railway.app/wp-json/wp/v2";

/** Posts per page on /blog and /blog/page/[n]. Nine fills the three-column card grid exactly. */
export const POSTS_PER_PAGE = 9;

/** How many 100-post batches getAllPosts() will walk before giving up, so a misbehaving API
 *  cannot spin the build forever. 2000 posts is far beyond anything this blog will hold. */
const MAX_BATCHES = 20;
const BATCH_SIZE = 100;

/** Per-locale REST query fragment. WordPress currently holds a single English post set, so every
 *  locale reads the same posts and all three fragments are empty — the same fallback convention
 *  getGuideContent() uses for guide copy whose translation column is not filled in yet.
 *
 *  This table is the switch point for going multilingual: under Polylang/WPML these become
 *  `&lang=en` / `&lang=ja` / `&lang=id`, and nothing outside this file has to change. */
const LOCALE_QUERY: Record<AppLocale, string> = { en: "", jp: "", id: "" };

/** Only the featured image is embedded. A bare `_embed` would also drag the author and every
 *  term back on a request that never looks at either. */
const EMBED = "_embed=wp:featuredmedia";

interface WPMedia {
    source_url?: string;
    alt_text?: string;
    media_details?: { width?: number; height?: number };
}

export interface WPPost {
    id: number;
    /** Site-local wall-clock time carrying no UTC offset — format `date_gmt` instead, or the
     *  server and the browser will disagree about what day a post went out. */
    date: string;
    date_gmt: string;
    modified_gmt: string;
    slug: string;
    /** The WordPress permalink. Never rendered — it points at the Railway origin, which must
     *  stay invisible to users and search engines. Used to recognise links between posts, see
     *  `rewriteInternalLinks` in blogContent.ts. */
    link: string;
    /** Documented as an identifier rather than a URL, but in practice the `?p=<id>` permalink —
     *  the form someone gets by copying a post's URL out of wp-admin. */
    guid: { rendered: string };
    title: { rendered: string };
    content: { rendered: string };
    excerpt: { rendered: string };
    featured_media: number;
    _embedded?: {
        "wp:featuredmedia"?: WPMedia[];
    };
}

export interface PostsPage {
    posts: WPPost[];
    /** Page count at POSTS_PER_PAGE, from the X-WP-TotalPages header. */
    totalPages: number;
    total: number;
    /** False only when WordPress could not be reached. Callers use it to tell "no posts yet"
     *  apart from "the CMS is down", so a sleeping Railway container shows a notice instead of
     *  an empty blog — and, more importantly, never fails `next build`. */
    ok: boolean;
}

const UNREACHABLE: PostsPage = { posts: [], totalPages: 0, total: 0, ok: false };

/** Returns null only when the request could not be completed at all (DNS, timeout, refused).
 *  HTTP error responses come back as-is, so callers can tell a page number past the end (400)
 *  from WordPress being down (5xx). */
async function wpFetch(path: string): Promise<Response | null> {
    try {
        return await fetch(`${WP_API}${path}`, { next: { revalidate: 60 } });
    } catch (error) {
        console.warn(`[wordpress] request failed: ${path}`, error);
        return null;
    }
}

function readCount(res: Response, header: string): number {
    const value = Number(res.headers.get(header));
    return Number.isFinite(value) && value > 0 ? value : 0;
}

/** One page of published posts, newest first. Revalidates every 60s (ISR) so a newly published
 *  post shows up without a redeploy. */
export async function getPosts(locale: AppLocale, page = 1): Promise<PostsPage> {
    const res = await wpFetch(
        `/posts?per_page=${POSTS_PER_PAGE}&page=${page}&${EMBED}${LOCALE_QUERY[locale]}`
    );
    if (!res) return UNREACHABLE;

    // WordPress answers a page number past the last page with 400 rest_post_invalid_page_number.
    // That is a real, reachable answer ("this page holds nothing"), not an outage — the caller
    // turns an empty page beyond the first into a 404.
    if (res.status === 400) return { posts: [], totalPages: 0, total: 0, ok: true };
    if (!res.ok) {
        console.warn(`[wordpress] /posts page ${page} returned ${res.status}`);
        return UNREACHABLE;
    }

    return {
        posts: (await res.json()) as WPPost[],
        totalPages: readCount(res, "x-wp-totalpages"),
        total: readCount(res, "x-wp-total"),
        ok: true,
    };
}

/** Every published post, newest first — for the sitemap and generateStaticParams, which both
 *  need the whole slug list rather than one page of it. Returns whatever it managed to collect,
 *  so a CMS outage degrades to a shorter sitemap instead of a failed build. */
export async function getAllPosts(locale: AppLocale): Promise<WPPost[]> {
    const collected: WPPost[] = [];

    for (let batch = 1; batch <= MAX_BATCHES; batch++) {
        const res = await wpFetch(
            `/posts?per_page=${BATCH_SIZE}&page=${batch}&${EMBED}${LOCALE_QUERY[locale]}`
        );
        if (!res?.ok) break;

        const posts = (await res.json()) as WPPost[];
        collected.push(...posts);
        if (posts.length < BATCH_SIZE) break;
    }

    return collected;
}

/** A single post by slug, or null when there is no such post (caller renders notFound()). */
export async function getPostBySlug(slug: string, locale: AppLocale): Promise<WPPost | null> {
    const res = await wpFetch(
        `/posts?slug=${encodeURIComponent(slug)}&${EMBED}${LOCALE_QUERY[locale]}`
    );
    if (!res?.ok) return null;

    const posts = (await res.json()) as WPPost[];
    return posts[0] ?? null;
}

export interface FeaturedImage {
    url: string;
    alt: string;
    width: number;
    height: number;
}

/** The one host `next/image` is configured to load from, derived from the API URL exactly as
 *  next.config.ts derives its `remotePatterns` entry. */
const WP_HOST = new URL(WP_API).hostname;

/** WordPress replaces the embedded media entry with an error object when the attachment is
 *  missing or unreadable, so the presence of `source_url` — not of the array element — is what
 *  actually tells you there is an image. */
export function featuredImage(post: WPPost): FeaturedImage | null {
    const media = post._embedded?.["wp:featuredmedia"]?.[0];
    if (!media?.source_url) return null;

    // An unconfigured host makes next/image throw, which takes down the whole post page rather
    // than just the picture. A media library served from somewhere else — a CDN offload plugin
    // is the usual way that happens — should cost a post its thumbnail, never its page.
    let host: string;
    try {
        host = new URL(media.source_url).hostname;
    } catch {
        return null;
    }
    if (host !== WP_HOST) {
        console.warn(
            `[wordpress] featured image skipped: "${host}" is not in next.config.ts ` +
                `images.remotePatterns. Add it there to render images from this host.`
        );
        return null;
    }

    return {
        url: media.source_url,
        alt: media.alt_text ?? "",
        width: media.media_details?.width ?? 1200,
        height: media.media_details?.height ?? 630,
    };
}

const NAMED_ENTITIES: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    hellip: "…",
    mdash: "—",
    ndash: "–",
    lsquo: "‘",
    rsquo: "’",
    ldquo: "“",
    rdquo: "”",
};

/** Strips tags and decodes the entities WordPress emits, for the places that need a bare string:
 *  <title>, meta descriptions, JSON-LD. Visible titles and excerpts keep their markup and go
 *  through dangerouslySetInnerHTML instead. */
export function plainText(html: string): string {
    return html
        .replace(/<[^>]*>/g, " ")
        .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
            const lower = code.toLowerCase();
            if (lower.startsWith("#x")) return String.fromCodePoint(parseInt(lower.slice(2), 16));
            if (lower.startsWith("#")) return String.fromCodePoint(Number(lower.slice(1)));
            return NAMED_ENTITIES[lower] ?? match;
        })
        .replace(/\s+/g, " ")
        .trim();
}

/** Search results cut meta descriptions off around 160 characters. */
export function truncate(text: string, max = 160): string {
    return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}
