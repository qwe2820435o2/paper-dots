// TODO: review this FAQ — content was inherited from the photo-booth scaffold and needs to be rewritten for Paper Dots.
import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about Paper Dots — the free browser-based Paper Dots app.",
  openGraph: {
    title: "Frequently Asked Questions — Paper Dots",
    description: "Answers to common questions about Paper Dots — the free browser-based Paper Dots app.",
    url: "/faq",
  },
};

const faqs: { question: string; answer: string; plainAnswer: string }[] = [
  {
    question: "What is Paper Dots?",
    plainAnswer:
      "Paper Dots is a free, browser-based Paper Dots app. Open the site, allow camera access, and take fun photo strips — no app download or account needed.",
    answer:
      "Paper Dots is a free, browser-based Paper Dots app. Open the site, allow camera access, and take fun photo strips — no app download or account needed.",
  },
  {
    question: "How do I use it?",
    plainAnswer:
      "Click \"Start Now\" on the homepage to open the booth. Choose your filters, set the shot count (2\u20139), and hit the camera button. After your shots are taken, you will be redirected to the edit page where you can pick a template, add stickers, and download your strip.",
    answer:
      "Click \"Start Now\" on the homepage to open the booth. Choose your filters, set the shot count (2\u20139), and hit the camera button. After your shots are taken, you will be redirected to the edit page where you can pick a template, add stickers, and download your strip.",
  },
  {
    question: "Do I need to install an app to use the online Paper Dots app?",
    plainAnswer:
      "No, our Paper Dots app website is entirely web-based. You can access the online camera and all its features directly through Chrome, Safari, or any modern browser on your desktop or mobile device.",
    answer:
      "No, our Paper Dots app website is entirely web-based. You can access the online camera and all its features directly through Chrome, Safari, or any modern browser on your desktop or mobile device.",
  },
  {
    question: "Is the online camera with filters actually free?",
    plainAnswer:
      "Yes. Paper Dots provides a camera online free of charge. There are no hidden fees, and we do not add watermarks to your photos.",
    answer:
      "Yes. Paper Dots provides a camera online free of charge. There are no hidden fees, and we do not add watermarks to your photos.",
  },
  {
    question: "What types of webcam filters are available?",
    plainAnswer:
      "We offer a wide range of webcam filters, including vintage film styles, black and white, and AI-driven beauty retouching that smooths skin tones and enhances facial features naturally.",
    answer:
      "We offer a wide range of webcam filters, including vintage film styles, black and white, and AI-driven beauty retouching that smooths skin tones and enhances facial features naturally.",
  },
  {
    question: "How do I get the best quality from my Paper Dots webcam?",
    plainAnswer:
      "To get the most out of your Paper Dots webcam, ensure you are in a well-lit area. Our AI will automatically sharpen the image, but good natural light helps the camera online capture the finest details.",
    answer:
      "To get the most out of your Paper Dots webcam, ensure you are in a well-lit area. Our AI will automatically sharpen the image, but good natural light helps the camera online capture the finest details.",
  },
  {
    question: "What file formats can I save my photos in?",
    plainAnswer:
      "When you finish your session on our Paper Dots online tool, you can download your images in high-quality .png formats, making them easy to print or upload to social media.",
    answer:
      "When you finish your session on our Paper Dots online tool, you can download your images in high-quality .png formats, making them easy to print or upload to social media.",
  },
  {
    question: "Is my privacy protected when using my camera online?",
    plainAnswer:
      "Yes, your online camera feed is processed locally for your preview. Photos are only saved to our servers temporarily during the generation process and are not shared with third parties.",
    answer:
      "Yes, your online camera feed is processed locally for your preview. Photos are only saved to our servers temporarily during the generation process and are not shared with third parties.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.plainAnswer },
  })),
};

export default function FAQPage() {
  return (
    <div className="min-h-[70vh] py-20 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground mb-12">
          Everything you need to know about Paper Dots.
        </p>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-serif font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
