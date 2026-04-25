import type { Metadata } from "next";
import MomentCardApp from "./MomentCardApp";

export const metadata: Metadata = {
    title: "Moment Card · Dottypic",
    description: "Turn a photo into a vibrant moment card. Extract the dominant color, add a title, and share.",
};

export default function MomentCardPage() {
    return <MomentCardApp />;
}
