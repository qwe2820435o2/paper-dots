import type { Metadata } from "next";
import { Mail, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Paper Dots team.",
  openGraph: {
    title: "Contact Us — Paper Dots",
    description: "Have a question or feedback? Get in touch with the Paper Dots team.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-[70vh] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-4">
          Contact Us
        </h1>
        <p className="text-muted-foreground mb-12">
          Have a question or feedback? We would love to hear from you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-4 p-6 rounded-2xl border border-border bg-card">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-semibold text-foreground mb-1">Email</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Send us an email and we will get back to you as soon as possible.
              </p>
              <a
                href="mailto:support@paperdots.example.com"
                className="text-sm font-medium text-primary hover:underline"
              >
                support@paperdots.example.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 rounded-2xl border border-border bg-card">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-semibold text-foreground mb-1">Feedback</h2>
              <p className="text-sm text-muted-foreground">
                Found a bug or have a feature request? Let us know — we are always improving Paper Dots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
