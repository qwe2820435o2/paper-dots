import type { Metadata } from "next";
import PolkaDotApp from "./PolkaDotApp";
import { getGuideRoute } from "@/content/guides/registry";
import { buildEditorMetadata } from "@/lib/guideSeo";

const route = getGuideRoute("polka-dot");

export const metadata: Metadata = buildEditorMetadata(
    {
        title: "Polka Dot Generator · Dottypic",
        description: "Generate a seamless polka dot background pattern and export it as PNG, SVG, or CSS.",
    },
    route
);

export default function PolkaDotPage() {
    return <PolkaDotApp />;
}
