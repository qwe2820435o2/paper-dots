import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/locales";
import { blogPostPath, formatPostDate, wpTimestamp } from "@/lib/blogSeo";
import { featuredImage, plainText, truncate, type WPPost } from "@/lib/wordpress";

interface Props {
    post: WPPost;
    locale: AppLocale;
    readMoreLabel: string;
}

/** One post in the /blog grid, shaped after the homepage tool cards (HomeToolGrid). Everything
 *  inside is a <span>, not a <div>, because the whole card is a single <a>. */
export default function BlogPostCard({ post, locale, readMoreLabel }: Props) {
    const image = featuredImage(post);

    // The excerpt goes in as plain text rather than as WordPress's markup: `excerpt.rendered`
    // wraps its text in a <p> and can carry a "Continue reading" <a>, and neither a block-level
    // element nor a nested anchor is valid inside this card's own <a>.
    const excerpt = truncate(plainText(post.excerpt.rendered), 150);

    return (
        <Link
            href={blogPostPath(post.slug)}
            className="group flex h-full flex-col overflow-hidden rounded-guide border-[1.5px] border-guide-edge bg-guide-card transition-all hover:-translate-y-1 hover:border-guide-edge-strong hover:shadow-guide"
        >
            <span className="relative block h-[200px] overflow-hidden border-b-[1.5px] border-guide-edge bg-guide-lime-3">
                {image ? (
                    <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                    />
                ) : (
                    // Posts without a featured image get the dotted rail motif instead of a gap,
                    // so the grid keeps an even rhythm.
                    <span className="blog-card-placeholder absolute inset-0" />
                )}
            </span>

            <span className="flex flex-1 flex-col px-6 pb-6 pt-[22px]">
                <time
                    dateTime={wpTimestamp(post.date_gmt)}
                    className="text-[13px] font-medium text-guide-mute"
                >
                    {formatPostDate(post, locale)}
                </time>

                <span
                    className="blog-display mt-2 text-xl font-bold leading-[1.2] tracking-[-0.02em] text-guide-ink"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />

                <span className="mb-[18px] mt-[9px] flex-1 text-[15px] leading-[1.5] text-guide-ink-2">
                    {excerpt}
                </span>

                <span className="blog-display inline-flex items-center gap-[7px] font-bold text-guide-ink">
                    {readMoreLabel}
                    <ArrowRight
                        size={16}
                        strokeWidth={2}
                        className="transition-transform group-hover:translate-x-[3px]"
                    />
                </span>
            </span>
        </Link>
    );
}
