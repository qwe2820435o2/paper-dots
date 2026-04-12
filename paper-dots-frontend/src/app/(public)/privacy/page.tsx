import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Dottypic handles your data and privacy.",
  openGraph: {
    title: "Privacy Policy — Dottypic",
    description: "Learn how Dottypic handles your data and privacy.",
    url: "/privacy",
  },
};

const sections = [
  {
    title: "Introduction",
    content:
      'Dottypic ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our browser-based photo decoration tool.',
  },
  {
    title: "Information We Collect",
    content:
      "We do not collect personal data. Dottypic is designed to work entirely in your browser. Photos you upload are processed locally on your device — they are never sent to our servers.",
  },
  {
    title: "Photo Processing",
    content:
      "All photo editing, texture rendering, and dot generation happens in your browser using client-side JavaScript. Your images do not leave your device at any point during the decoration or export process.",
  },
  {
    title: "Cookies & Local Storage",
    content:
      "We may use browser local storage to save your editor preferences between sessions (such as your last selected paper or dot settings). We also use Google Analytics to collect anonymous usage statistics (such as page views and session duration) to help us improve the service. Google Analytics may use cookies to collect this data. No personally identifiable information is collected.",
  },
  {
    title: "Third-Party Services",
    content:
      "Dottypic does not share any data with third-party services. There are no embedded advertising networks or external analytics platforms in our application.",
  },
  {
    title: "Your Rights",
    content:
      "Since we do not collect or store personal data, there is nothing to access, modify, or delete. If you have any concerns about your privacy while using Dottypic, please contact us.",
  },
  {
    title: "Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated revision date.",
  },
  {
    title: "Contact",
    content: null,
    isContact: true,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-[70vh] bg-white py-20 px-5 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1
          className="text-[42px] sm:text-[62px] font-medium text-[#1a1a2e] mb-2"
          style={{
            fontFamily: "var(--font-quicksand), sans-serif",
            letterSpacing: "-3px",
            lineHeight: "1.0",
          }}
        >
          Privacy Policy
        </h1>
        <p className="text-[13px] mb-16 text-[#64748b]">
          Last updated: March 26, 2026
        </p>

        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2
                className="text-[18px] font-semibold text-[#1a1a2e] mb-3 tracking-[-0.4px]"
              >
                {s.title}
              </h2>
              {s.isContact ? (
                <p className="text-[15px] leading-[1.7] text-[#64748b]">
                  If you have questions about this Privacy Policy, please reach out at{" "}
                  <a
                    href="mailto:support@dottypic.com"
                    className="text-[#C5E89A] hover:text-[#9ED06C] transition-colors"
                  >
                    support@dottypic.com
                  </a>
                  .
                </p>
              ) : (
                <p className="text-[15px] leading-[1.7] text-[#64748b]">
                  {s.content}
                </p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
