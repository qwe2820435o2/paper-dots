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
    <div className="min-h-[70vh] bg-black py-20 px-5 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1
          className="text-[42px] sm:text-[62px] font-medium text-white mb-4"
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            letterSpacing: "-3px",
            lineHeight: "1.0",
          }}
        >
          Contact Us
        </h1>
        <p
          className="text-[16px] leading-[1.6] mb-14"
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            color: "#a6a6a6",
          }}
        >
          Have a question or feedback? We would love to hear from you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div
            className="flex items-start gap-4 p-6 rounded-[12px]"
            style={{
              background: "#090909",
              boxShadow: "rgba(0, 153, 255, 0.15) 0px 0px 0px 1px",
            }}
          >
            <div
              className="shrink-0 w-9 h-9 rounded-[8px] flex items-center justify-center"
              style={{ background: "rgba(0,153,255,0.12)" }}
            >
              <Mail className="w-4 h-4" style={{ color: "#0099ff" }} strokeWidth={1.8} />
            </div>
            <div>
              <h2
                className="text-[15px] font-medium text-white mb-1"
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  letterSpacing: "-0.2px",
                }}
              >
                Email
              </h2>
              <p
                className="text-[14px] leading-[1.6] mb-3"
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  color: "#a6a6a6",
                }}
              >
                Send us an email and we will get back to you as soon as possible.
              </p>
              <a
                href="mailto:support@paperdots.app"
                className="text-[14px] font-medium transition-opacity hover:opacity-75"
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  color: "#0099ff",
                }}
              >
                support@paperdots.app
              </a>
            </div>
          </div>

          {/* Feedback */}
          <div
            className="flex items-start gap-4 p-6 rounded-[12px]"
            style={{
              background: "#090909",
              boxShadow: "rgba(0, 153, 255, 0.15) 0px 0px 0px 1px",
            }}
          >
            <div
              className="shrink-0 w-9 h-9 rounded-[8px] flex items-center justify-center"
              style={{ background: "rgba(0,153,255,0.12)" }}
            >
              <MessageSquare className="w-4 h-4" style={{ color: "#0099ff" }} strokeWidth={1.8} />
            </div>
            <div>
              <h2
                className="text-[15px] font-medium text-white mb-1"
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  letterSpacing: "-0.2px",
                }}
              >
                Feedback
              </h2>
              <p
                className="text-[14px] leading-[1.6]"
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  color: "#a6a6a6",
                }}
              >
                Found a bug or have a feature request? Let us know — we are always improving Paper Dots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
