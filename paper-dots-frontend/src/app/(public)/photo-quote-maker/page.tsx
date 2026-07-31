import type { Metadata } from "next";
import { getGuideContent } from "@/content/guides";
import { getGuideRoute } from "@/content/guides/registry";
import { buildGuideMetadata, buildGuideJsonLd } from "@/lib/guideSeo";
import GuideTemplate from "@/components/guide/GuideTemplate";

const SLUG = "moment-card" as const;
const content = getGuideContent(SLUG);
const route = getGuideRoute(SLUG);

export const metadata: Metadata = buildGuideMetadata(content, route);

const jsonLd = buildGuideJsonLd(content, route);

export default function MomentCardGuidePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <GuideTemplate content={content} slug={SLUG} appPath={route.appPath} />
        </>
    );
}
