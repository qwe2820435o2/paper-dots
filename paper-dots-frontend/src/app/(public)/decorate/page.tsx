import type { Metadata } from "next";
import DecorateApp from "./DecorateApp";

export const metadata: Metadata = {
  title: "Decorate · Mochipic",
  description: "Upload a photo, pick a paper, scatter dots.",
};

export default function DecoratePage() {
  return <DecorateApp />;
}
