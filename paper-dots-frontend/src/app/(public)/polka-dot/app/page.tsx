import type { Metadata } from "next";
import PolkaDotApp from "./PolkaDotApp";

export const metadata: Metadata = {
    title: "Polka Dot Generator · Dottypic",
    description: "Generate a seamless polka dot background pattern and export it as PNG, SVG, or CSS.",
};

export default function PolkaDotPage() {
    return <PolkaDotApp />;
}
