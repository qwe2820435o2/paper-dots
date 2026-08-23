import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import MomentCardApp from "./MomentCardApp";
import { getGuideRoute } from "@/content/guides/registry";
import { buildEditorMetadata } from "@/lib/guideSeo";
import type { AppLocale } from "@/i18n/locales";

const route = getGuideRoute("moment-card");

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "editorMeta.momentCard" });
    return buildEditorMetadata({ title: t("title"), description: t("description") }, route, locale);
}

export default async function MomentCardPage({
    params,
}: {
    params: Promise<{ locale: AppLocale }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    return <MomentCardApp />;
}
