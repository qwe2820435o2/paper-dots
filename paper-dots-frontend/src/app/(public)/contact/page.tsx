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
    <div className="min-h-[70vh] bg-white py-20 px-5 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1
          className="text-[42px] sm:text-[62px] font-medium text-[#1a1a2e] mb-4"
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            letterSpacing: "-3px",
            lineHeight: "1.0",
          }}
        >
          Contact Us
        </h1>
        <p className="text-[16px] leading-[1.6] mb-14 text-[#64748b]">
          Have a question or feedback? We would love to hear from you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-pink-50">
              <Mail className="w-4 h-4 text-[#F39EB6]" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-1 tracking-[-0.2px]">
                Email
              </h2>
              <p className="text-[14px] leading-[1.6] mb-3 text-[#64748b]">
                Send us an email and we will get back to you as soon as possible.
              </p>
              <a
                href="mailto:support@paperdots.app"
                className="text-[14px] font-medium text-[#F39EB6] hover:text-[#E8809E] transition-colors"
              >
                support@paperdots.app
              </a>
            </div>
          </div>

          {/* Feedback */}
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-pink-50">
              <MessageSquare className="w-4 h-4 text-[#F39EB6]" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1a1a2e] mb-1 tracking-[-0.2px]">
                Feedback
              </h2>
              <p className="text-[14px] leading-[1.6] text-[#64748b]">
                Found a bug or have a feature request? Let us know — we are always improving Paper Dots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
