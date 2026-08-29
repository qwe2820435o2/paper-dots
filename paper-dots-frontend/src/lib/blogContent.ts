import type { AppLocale } from "@/i18n/locales";
import { blogPostPath } from "@/lib/blogSeo";
import { localizedPath } from "@/lib/i18nSeo";
import type { WPPost } from "@/lib/wordpress";

/** Strips the parts of a WordPress URL that vary without changing what it points at, so an
 *  editor's `http://`, or a link pasted with or without its trailing slash, still matches. */
function normalize(url: string): string {
    return url.trim().replace(/^http:\/\//i, "https://").replace(/\/+$/, "").toLowerCase();
}

/** Every published post's WordPress URL, mapped to its slug.
 *
 *  Deliberately an exact lookup rather than "take the last path segment as the slug". That
 *  shortcut happens to work under the current permalink structure (`/2026/08/28/hello-world/`)
 *  and costs no request, but it starts producing wrong links the moment someone changes the
 *  permalink setting in wp-admin, and it would just as happily turn `/category/uncategorized/`
 *  into a link to a post that does not exist.
 *
 *  Both URL forms WordPress hands out are keyed: `link` is what the editor's link search
 *  inserts, `guid` is the `?p=<id>` form you get by copying a URL out of wp-admin. */
function buildLinkMap(posts: WPPost[]): Map<string, string> {
    const map = new Map<string, string>();

    for (const post of posts) {
        map.set(normalize(post.link), post.slug);
        if (post.guid?.rendered) map.set(normalize(post.guid.rendered), post.slug);
    }

    return map;
}

/** The CMS origin, read off the posts themselves so this module never names the Railway host a
 *  second time. */
function originOf(posts: WPPost[]): string | null {
    for (const post of posts) {
        try {
            return new URL(post.link).origin.toLowerCase();
        } catch {
            // A malformed permalink on one post says nothing about the next one.
        }
    }
    return null;
}

/** Rewrites links between posts so they stay on dottypic.com. Anything else is returned
 *  untouched.
 *
 *  Only `href` is considered: `src` attributes point at the WordPress media library, which is
 *  exactly where images are meant to load from.
 *
 *  The rewritten path carries the locale prefix. This content is injected as raw HTML, so its
 *  anchors never go through `@/i18n/navigation`'s Link — a bare `/blog/other` would drop a
 *  reader who is on /jp/blog/… back onto the English URL. */
export function rewriteInternalLinks(
    html: string,
    posts: WPPost[],
    locale: AppLocale
): string {
    const map = buildLinkMap(posts);
    const origin = originOf(posts);

    return html.replace(/href="([^"]*)"/g, (attribute, href: string) => {
        const slug = map.get(normalize(href));
        if (slug) {
            return `href="${localizedPath(blogPostPath(slug), locale)}"`;
        }

        // Posts are only ever meant to link to other posts, so anything else pointing at the CMS
        // is a content mistake rather than a case to handle. It is left exactly as written; the
        // warning is here so it surfaces in the build log instead of quietly walking a reader
        // off the site. Media URLs are excluded — those are supposed to be on that origin.
        if (origin && !href.includes("/wp-content/") && startsWithOrigin(href, origin)) {
            console.warn(`[blog] link to the WordPress origin left as-is (not a known post): ${href}`);
        }

        return attribute;
    });
}

function startsWithOrigin(href: string, origin: string): boolean {
    try {
        return new URL(href).origin.toLowerCase() === origin;
    } catch {
        // Relative hrefs land here, which is the right answer: they are not CMS links.
        return false;
    }
}
