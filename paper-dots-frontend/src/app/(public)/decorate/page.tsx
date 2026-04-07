import type { Metadata } from "next";
import DecorateApp from "./DecorateApp";

export const metadata: Metadata = {
  title: "Decorate · Paper Dots",
  description: "Upload a photo, pick a paper, scatter dots.",
};

export default function DecoratePage() {
  return <DecorateApp />;
}
