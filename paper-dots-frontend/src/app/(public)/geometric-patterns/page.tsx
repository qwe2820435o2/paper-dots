import type { Metadata } from "next";
import GeometricPatternsApp from "./GeometricPatternsApp";

export const metadata: Metadata = {
    title: "Geometric Pattern Maker · Dottypic",
    description: "Generate a randomized grid of geometric shapes and export it as SVG, PNG, or JPEG.",
};

export default function GeometricPatternsPage() {
    return <GeometricPatternsApp />;
}
