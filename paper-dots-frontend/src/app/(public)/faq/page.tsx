import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about Mochipic.",
  openGraph: {
    title: "Frequently Asked Questions — Mochipic",
    description: "Answers to common questions about Mochipic.",
    url: "/faq",
  },
};

const faqs: { question: string; answer: string }[] = [
  {
    question: "Is Mochipic's dot image generator free to use?",
    answer:
      "Yes! You get full access to our Automatic Photo Collage Maker and all design elements for free. Best of all? No watermarks on your final masterpieces.",
  },
  {
    question: "Do I need to register to use the dot image generator?",
    answer:
      'No registration required! We believe in "creating on the go." Just upload, edit your polka dot pattern, and download. Simple as that.',
  },
  {
    question: "Can I customize the density of the polka dot pattern?",
    answer:
      "Absolutely. You have full control over the polka dots pattern. You can adjust the shape, size, color, and spacing to create a look that is uniquely yours.",
  },
  {
    question: "Can I change the dots to other shapes?",
    answer:
      "Of course! While we love a classic polka dot setting, you can switch to hearts, stars, or waterdrops to match your specific vibe.",
  },
  {
    question: 'How does the "Auto-Analyze" feature work?',
    answer:
      "Our smart tool \"reads\" the dominant colors in your uploaded images and automatically suggests a dot pattern and background color that complements your photo perfectly. It's like having a tiny designer in your pocket!",
  },
  {
    question: "Can I use my own background images?",
    answer:
      "Yes! You can use our AI-generated colors or upload your own favorite textures and patterns to use as a base for your collage.",
  },
  {
    question: "Will the dot image generator work on my phone?",
    answer:
      "Yes! Mochipic is optimized for mobile and desktop browsers, so you can create aesthetic collages whenever inspiration strikes.",
  },
  {
    question: "How does the Automatic Photo Collage Maker handle my privacy?",
    answer:
      "Your photos stay yours. Mochipic processes everything locally in your browser. We never store or upload your images to a server, ensuring 100% privacy and security.",
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
            fontFamily: "var(--font-quicksand), sans-serif",
            letterSpacing: "-3px",
            lineHeight: "1.0",
          }}
        >
          FAQ
        </h1>
        <p className="text-[16px] leading-[1.6] mb-14 text-[#64748b]">
          Everything you need to know about Mochipic.
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
