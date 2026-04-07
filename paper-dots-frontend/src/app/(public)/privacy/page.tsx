// TODO: review this Privacy Policy — content was inherited from the photo-booth scaffold and needs to be rewritten for Paper Dots.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Paper Dots handles your data and privacy.",
  openGraph: {
    title: "Privacy Policy — Paper Dots",
    description: "Learn how Paper Dots handles your data and privacy.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-[70vh] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-semibold text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-14">
          Last updated: March 26, 2026
        </p>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Paper Dots (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we handle information when you use our browser-based Paper Dots app service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground font-semibold">We do not collect personal data.</strong>{" "}
              Paper Dots is designed to work entirely in your browser. Your photos are captured, edited, and
              downloaded locally on your device — they are never uploaded to our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Camera Access</h2>
            <p className="text-muted-foreground leading-relaxed">
              Paper Dots requests access to your device camera solely to provide the Paper Dots app experience.
              Camera access is controlled by your browser and can be revoked at any time through your browser
              settings. We do not record, store, or transmit any camera footage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Cookies &amp; Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may use browser local storage to save your preferences (such as theme settings). We do not
              use tracking cookies or third-party analytics that collect personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Paper Dots does not share any data with third-party services. There are no embedded trackers,
              advertising networks, or external analytics platforms integrated into our application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Since we do not collect or store personal data, there is no personal information to access,
              modify, or delete. If you have any concerns about your privacy while using Paper Dots, please
              contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be reflected on this
              page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy, please reach out to us at{" "}
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
