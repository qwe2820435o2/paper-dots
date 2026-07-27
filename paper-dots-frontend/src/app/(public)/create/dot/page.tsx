import type { Metadata } from "next";
import DecorateApp from "./DecorateApp";
import { getGuideRoute } from "@/content/guides/registry";
import { buildEditorMetadata } from "@/lib/guideSeo";

const route = getGuideRoute("dot");

export const metadata: Metadata = buildEditorMetadata(
  {
    title: "Dot · Dottypic",
    description: "Upload a photo, pick a paper, scatter dots.",
  },
  route
);

export default function DecoratePage() {
  return <DecorateApp />;
}
