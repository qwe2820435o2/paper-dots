// TODO: review these Terms of Service — content was inherited from the photo-booth scaffold and needs to be rewritten for Paper Dots.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms and conditions for using Paper Dots.",
  openGraph: {
    title: "Terms of Service — Paper Dots",
    description: "Read the terms and conditions for using Paper Dots.",
    url: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-[70vh] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-14">
          Last updated: March 26, 2026
        </p>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Paper Dots, you agree to be bound by these Terms of Service.
              If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Paper Dots is a free, browser-based Paper Dots app application that allows you to take photos
              using your webcam, apply filters and templates, add stickers, and download photo strips.
              All processing occurs locally in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">User Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree to use Paper Dots only for lawful purposes. You must not:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "Use the service to create or distribute illegal, harmful, or offensive content.",
                "Attempt to reverse-engineer, modify, or interfere with the application.",
                "Use automated tools to scrape or overload the service.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Paper Dots application, including its design, code, templates, stickers, and visual assets,
              is the intellectual property of Paper Dots. You may not copy, reproduce, or redistribute any
              part of the application without prior written consent.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Photos you create using Paper Dots are yours. We claim no ownership over the content you generate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              Paper Dots is provided &quot;as is&quot; without warranties of any kind, express or implied. We do
              not guarantee that the service will be uninterrupted, error-free, or compatible with all devices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, Paper Dots shall not be liable for any indirect,
              incidental, or consequential damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Changes to These Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Continued use of Paper Dots
              after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms of Service, please contact us at{" "}
              <a
                href="mailto:support@paperdots.example.com"
                className="text-primary hover:underline"
              >
                support@paperdots.example.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
