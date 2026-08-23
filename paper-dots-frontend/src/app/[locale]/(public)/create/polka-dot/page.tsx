import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PolkaDotApp from "./PolkaDotApp";
import { getGuideRoute } from "@/content/guides/registry";
import { buildEditorMetadata } from "@/lib/guideSeo";
import type { AppLocale } from "@/i18n/locales";

const route = getGuideRoute("polka-dot");

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "editorMeta.polkaDot" });
    return buildEditorMetadata({ title: t("title"), description: t("description") }, route, locale);
}

export default async function PolkaDotPage({
    params,
}: {
    params: Promise<{ locale: AppLocale }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);
    return <PolkaDotApp />;
}
