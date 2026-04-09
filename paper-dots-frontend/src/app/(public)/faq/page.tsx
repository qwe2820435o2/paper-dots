import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about Paper Dots.",
  openGraph: {
    title: "Frequently Asked Questions — Paper Dots",
    description: "Answers to common questions about Paper Dots.",
    url: "/faq",
  },
};

const faqs: { question: string; answer: string }[] = [
  {
    question: "What is Paper Dots?",
    answer:
      "Paper Dots is a free, browser-based tool that lets you decorate your photos with hand-drawn paper textures and scattered dot patterns. Upload a photo, pick a paper style, adjust the dots, and download the result — no account or app install needed.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes, completely free. There are no hidden fees, subscriptions, or watermarks added to your exported images.",
  },
  {
    question: "What photo formats can I upload?",
    answer:
      "Paper Dots accepts JPEG, PNG, and WEBP images. Any modern photo from your phone or camera will work.",
  },
  {
    question: "Do my photos get uploaded to a server?",
    answer:
      "No. All processing happens locally in your browser. Your photos never leave your device — they are not uploaded, stored, or shared with anyone.",
  },
  {
    question: "What paper textures are available?",
    answer:
      "Paper Dots includes a curated set of hand-drawn paper styles — from smooth white to rough kraft and soft watercolor. Each texture gives your photo a different tactile feel.",
  },
  {
    question: "How do I control the dots?",
    answer:
      "The Dots panel lets you choose the shape (circle, square, teardrop), adjust density and size with sliders, pick a color, and hit Reroll to randomize the dot positions.",
  },
  {
    question: "What resolution is the exported PNG?",
    answer:
      "Exports are rendered at 2x pixel ratio on a 1080×1080 canvas, giving you a 2160×2160 PNG — sharp enough to print or share at any size.",
  },
  {
    question: "Does it work on mobile?",
    answer:
      "Yes. Paper Dots is designed to work in any modern browser on desktop or mobile. The editor layout adapts to smaller screens.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function FAQPage() {
  return (
    <div className="min-h-[70vh] bg-white py-20 px-5 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <h1
          className="text-[42px] sm:text-[62px] font-medium text-[#1a1a2e] mb-4"
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            letterSpacing: "-3px",
            lineHeight: "1.0",
          }}
        >
          FAQ
        </h1>
        <p className="text-[16px] leading-[1.6] mb-14 text-[#64748b]">
          Everything you need to know about Paper Dots.
        </p>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-slate-200"
            >
              <AccordionTrigger
                className="text-left hover:no-underline hover:opacity-80 py-5 text-[15px] font-medium text-[#1a1a2e] tracking-[-0.2px]"
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[15px] leading-[1.7] text-[#64748b]">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
