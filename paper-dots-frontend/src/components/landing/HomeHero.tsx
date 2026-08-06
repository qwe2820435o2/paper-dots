import { Upload } from "lucide-react";
import GuideCtaButton from "@/components/guide/GuideCtaButton";
import { GUIDE_WRAP } from "@/components/guide/guideLayout";

/** Mockup's illustrated "one photo -> ready-to-post output" hero art. Static, developer-authored
 *  markup with no user input, so it is injected as a string rather than hand-translated into a
 *  few thousand characters of JSX (see the plan's rationale for `dangerouslySetInnerHTML` here). */
const HERO_ART_SVG = `<svg viewBox="0 0 1200 820" xmlns="http://www.w3.org/2000/svg" font-family="DM Sans, sans-serif"><defs><radialGradient id="bg" cx="38%" cy="34%" r="78%"><stop offset="0" stop-color="#f3f9ea"/><stop offset="1" stop-color="#eef7e2"/></radialGradient><linearGradient id="arc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c5e89a"/><stop offset="1" stop-color="#e8967a"/></linearGradient><filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="26" flood-color="#1d300e" flood-opacity="0.14"/></filter><filter id="soft2" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#1d300e" flood-opacity="0.16"/></filter></defs><rect width="1200" height="820" rx="0" fill="url(#bg)"/><g opacity=".5"><circle cx="150" cy="120" r="9" fill="#c5e89a"/><path d="M12 1.8 15 9.1l7.8.5-6 5 1.9 7.6L12 18l-6.7 4.2L7.2 14.6l-6-5L9 9.1Z" fill="#ff5d8f" transform="translate(1040 140) scale(1.1) translate(-12 -12)"/><circle cx="1090" cy="640" r="7" fill="#c5e89a"/><path d="M12 21.3S3.6 15.9 3.6 10.3A4.7 4.7 0 0 1 12 7.2a4.7 4.7 0 0 1 8.4 3.1c0 5.6-8.4 11-8.4 11Z" fill="#f4a97f" transform="translate(120 660) scale(1.0) translate(-12 -12)"/><circle cx="600" cy="70" r="5" fill="#3c4a30" opacity=".4"/></g><g transform="translate(150 250) rotate(-7)" filter="url(#soft)"><rect x="0" y="0" width="300" height="360" rx="22" fill="#fff"/><clipPath id="rawc"><rect x="16" y="16" width="268" height="300" rx="12"/></clipPath><g clip-path="url(#rawc)"><g transform="translate(16 16) scale(2.68 3.0)"><rect width="100" height="100" fill="#f4a97f"/><circle cx="50" cy="34" r="15" fill="#ffd9a8"/><path d="M0 62 Q25 52 50 60 T100 58 V100 H0Z" fill="#e07d5a"/><path d="M0 74 Q30 66 60 72 T100 70 V100 H0Z" fill="#c25a3e"/><ellipse cx="50" cy="70" rx="15" ry="17" fill="#3c2a24"/><rect x="38" y="82" width="24" height="20" rx="11" fill="#3c2a24"/><circle cx="50" cy="60" r="9" fill="#4a352d"/></g></g><text x="150" y="345" text-anchor="middle" font-family="DM Mono, monospace" font-size="18" fill="#6f7d62" letter-spacing="1">your photo</text></g><path d="M470 300 C 600 210, 690 210, 770 290" fill="none" stroke="url(#arc)" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 20"/><g transform="translate(628 214)"><circle r="30" fill="#fff" filter="url(#soft2)"/><path d="M-9 0 L7 0 M1 -7 L8 0 L1 7" fill="none" stroke="#15200d" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 -14 l2 -5 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2Z" fill="#ff5d8f"/></g><g filter="url(#soft)" transform="translate(720 190) rotate(4)"><g transform="translate(0 0)"><rect x="0" y="0" width="360" height="457.12" rx="26" fill="#ffffff"/><rect x="0" y="0" width="360" height="457.12" rx="26" fill="none" stroke="#e3e9d8" stroke-width="2"/><clipPath id="fpc"><rect x="22" y="22" width="316" height="259.12" rx="16"/></clipPath><g clip-path="url(#fpc)"><g transform="translate(22 22) scale(3.16 2.5912)"><rect width="100" height="100" fill="#f4a97f"/><circle cx="50" cy="34" r="15" fill="#ffd9a8"/><path d="M0 62 Q25 52 50 60 T100 58 V100 H0Z" fill="#e07d5a"/><path d="M0 74 Q30 66 60 72 T100 70 V100 H0Z" fill="#c25a3e"/><ellipse cx="50" cy="70" rx="15" ry="17" fill="#3c2a24"/><rect x="38" y="82" width="24" height="20" rx="11" fill="#3c2a24"/><circle cx="50" cy="60" r="9" fill="#4a352d"/></g></g><rect x="22" y="295.12" width="316" height="96" rx="16" fill="#3c2a24"/><rect x="40" y="323.12" width="195.92" height="12" rx="6" fill="#ffe4d2"/><rect x="40" y="347.12" width="139.04" height="12" rx="6" fill="#ffe4d2" opacity=".7"/><text x="180" y="429.12" text-anchor="middle" font-family="DM Mono, monospace" font-size="17" fill="#6f7d62" letter-spacing="1">ready to post</text></g></g></svg>`;

export default function HomeHero() {
    return (
        <section className="pb-[60px] pt-[70px] lg:pt-20">
            <div className={GUIDE_WRAP}>
                <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.06fr)]">
                    <div>
                        <h1 className="text-balance" style={{ fontSize: "clamp(44px, 4.6vw, 68px)" }}>
                            Free Aesthetic Photo Editor for <span className="swash">Everyone</span>
                        </h1>
                        <p className="mt-6 max-w-[44ch] text-[19px] text-guide-ink-2">
                            Small, easy tools that turn any photo into something you would actually
                            post. No layers, no learning curve, nothing to install.
                        </p>

                        <div className="mt-[34px] flex flex-wrap items-center gap-5">
                            <GuideCtaButton href="/create/polka-dot" trackId="home-hero">
                                <Upload size={19} strokeWidth={2.2} />
                                Upload a photo
                            </GuideCtaButton>
                            <span className="guide-mono flex items-center gap-2 text-[12.5px] text-guide-mute">
                                <span className="h-2 w-2 rounded-full bg-guide-edge-strong" />
                                Free · No watermark · No sign up
                            </span>
                        </div>
                    </div>

                    <div
                        aria-hidden
                        className="[&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
                        dangerouslySetInnerHTML={{ __html: HERO_ART_SVG }}
                    />
                </div>
            </div>
        </section>
    );
}
