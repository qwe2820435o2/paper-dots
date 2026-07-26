import type { Metadata } from "next";
import MomentCardApp from "./MomentCardApp";
import { getGuideRoute } from "@/content/guides/registry";
import { buildEditorMetadata } from "@/lib/guideSeo";

const route = getGuideRoute("moment-card");

export const metadata: Metadata = buildEditorMetadata(
    {
        title: "Moment Card · Dottypic",
        description: "Turn a photo into a vibrant moment card. Extract the dominant color, add a title, and share.",
    },
    route
);

export default function MomentCardPage() {
    return <MomentCardApp />;
}
