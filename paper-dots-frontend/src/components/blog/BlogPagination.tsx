import { ArrowLeft, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/locales";
import { blogListPath } from "@/lib/blogSeo";

const STEP_CLASS =
    "blog-display inline-flex items-center gap-2 rounded-guide-sm border border-guide-edge bg-guide-card px-[18px] py-3 text-[15px] font-bold text-guide-ink transition-all hover:-translate-y-[2px] hover:border-guide-ink hover:shadow-guide";

export default async function BlogPagination({
    page,
    totalPages,
    locale,
}: {
    page: number;
    totalPages: number;
    locale: AppLocale;
}) {
    if (totalPages <= 1) return null;

    const t = await getTranslations({ locale, namespace: "blog.pagination" });

    return (
        <nav className="mt-14 flex items-center justify-between gap-4">
            {page > 1 ? (
                // blogListPath() sends page 1 to /blog rather than /blog/page/1, so a page of
                // results never has two URLs.
                <Link href={blogListPath(page - 1)} className={STEP_CLASS} rel="prev">
                    <ArrowLeft size={16} strokeWidth={2} />
                    {t("previous")}
                </Link>
            ) : (
                <span />
            )}

            <span className="text-[14px] font-medium text-guide-mute">
                {t("status", { page, total: totalPages })}
            </span>

            {page < totalPages ? (
                <Link href={blogListPath(page + 1)} className={STEP_CLASS} rel="next">
                    {t("next")}
                    <ArrowRight size={16} strokeWidth={2} />
                </Link>
            ) : (
                <span />
            )}
        </nav>
    );
}
