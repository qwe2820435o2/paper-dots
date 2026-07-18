import type { Metadata } from "next";
import DecorateApp from "./DecorateApp";

export const metadata: Metadata = {
  title: "Dot · Dottypic",
  description: "Upload a photo, pick a paper, scatter dots.",
};

export default function DecoratePage() {
  return <DecorateApp />;
}
