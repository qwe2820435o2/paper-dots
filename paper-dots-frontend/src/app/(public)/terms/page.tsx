import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms and conditions for using Mochipic.",
  openGraph: {
    title: "Terms of Service — Mochipic",
    description: "Read the terms and conditions for using Mochipic.",
    url: "/terms",
  },
};

const prohibited = [
  "Use the service to create or distribute illegal, harmful, or offensive content.",
  "Attempt to reverse-engineer, modify, or interfere with the application.",
  "Use automated tools to scrape or overload the service.",
];

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-[13px] mb-16 text-[#64748b]">
          Last updated: March 26, 2026
        </p>

        <div className="space-y-10">
          <section>
            <h2 className="text-[18px] font-semibold text-[#1a1a2e] mb-3 tracking-[-0.4px]">
              Acceptance of Terms
            </h2>
            <p className="text-[15px] leading-[1.7] text-[#64748b]">
              By accessing or using Mochipic, you agree to be bound by these Terms of Service.
              If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#1a1a2e] mb-3 tracking-[-0.4px]">
              Description of Service
            </h2>
            <p className="text-[15px] leading-[1.7] text-[#64748b]">
              Mochipic is a free, browser-based photo decoration tool. You upload a photo, apply
              a paper texture, configure dot patterns, and download the result as a PNG. All
              processing occurs locally in your browser — no server upload is required.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#1a1a2e] mb-3 tracking-[-0.4px]">
              User Conduct
            </h2>
            <p className="text-[15px] leading-[1.7] mb-4 text-[#64748b]">
              You agree to use Mochipic only for lawful purposes. You must not:
            </p>
            <ul className="space-y-3">
              {prohibited.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[15px] leading-[1.7] text-[#64748b]"
                >
                  <span className="mt-[9px] shrink-0 w-1.5 h-1.5 rounded-full bg-[#C5E89A]/40" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#1a1a2e] mb-3 tracking-[-0.4px]">
              Intellectual Property
            </h2>
            <p className="text-[15px] leading-[1.7] mb-4 text-[#64748b]">
              The Mochipic application — including its design, code, paper textures, and visual
              assets — is the intellectual property of Mochipic. You may not copy, reproduce, or
              redistribute any part of the application without prior written consent.
            </p>
            <p className="text-[15px] leading-[1.7] text-[#64748b]">
              Photos you decorate using Mochipic are yours. We claim no ownership over the
              content you generate.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#1a1a2e] mb-3 tracking-[-0.4px]">
              Disclaimer of Warranties
            </h2>
            <p className="text-[15px] leading-[1.7] text-[#64748b]">
              Mochipic is provided &quot;as is&quot; without warranties of any kind, express or
              implied. We do not guarantee that the service will be uninterrupted, error-free, or
              compatible with all devices.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#1a1a2e] mb-3 tracking-[-0.4px]">
              Limitation of Liability
            </h2>
            <p className="text-[15px] leading-[1.7] text-[#64748b]">
              To the fullest extent permitted by law, Mochipic shall not be liable for any
              indirect, incidental, or consequential damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#1a1a2e] mb-3 tracking-[-0.4px]">
              Changes to These Terms
            </h2>
            <p className="text-[15px] leading-[1.7] text-[#64748b]">
              We reserve the right to modify these Terms of Service at any time. Continued use of
              Mochipic after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#1a1a2e] mb-3 tracking-[-0.4px]">
              Contact
            </h2>
            <p className="text-[15px] leading-[1.7] text-[#64748b]">
              If you have questions about these Terms of Service, please contact us at{" "}
              <a
                href="mailto:support@mochipic.io"
                className="text-[#C5E89A] hover:text-[#9ED06C] transition-colors"
              >
                support@mochipic.io
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
