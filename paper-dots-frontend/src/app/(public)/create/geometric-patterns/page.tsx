import type { Metadata } from "next";
import GeometricPatternsApp from "./GeometricPatternsApp";
import { getGuideRoute } from "@/content/guides/registry";
import { buildEditorMetadata } from "@/lib/guideSeo";

const route = getGuideRoute("geometric-patterns");

export const metadata: Metadata = buildEditorMetadata(
    {
        title: "Geometric Pattern Maker · Dottypic",
        description: "Generate a randomized grid of geometric shapes and export it as SVG, PNG, or JPEG.",
    },
    route
);

export default function GeometricPatternsPage() {
    return <GeometricPatternsApp />;
}
