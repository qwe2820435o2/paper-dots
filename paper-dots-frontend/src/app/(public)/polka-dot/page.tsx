import type { Metadata } from "next";
import { getGuideContent } from "@/content/guides";
import { getGuideRoute } from "@/content/guides/registry";
import GuideTemplate from "@/components/guide/GuideTemplate";

const SLUG = "polka-dot" as const;
const content = getGuideContent(SLUG);
const route = getGuideRoute(SLUG);

// Canonical + JSON-LD land in a follow-up SEO module (src/lib/guideSeo.ts); this is the
// minimal metadata needed to ship the guide itself.
export const metadata: Metadata = {
    title: content.meta.title,
    description: content.meta.description,
};

export default function PolkaDotGuidePage() {
    return <GuideTemplate content={content} appPath={route.appPath} />;
}
