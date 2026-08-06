import Link from "next/link";
import Image from "next/image";
import { guideFontClass } from "@/lib/fonts";
import { GUIDE_WRAP } from "@/components/guide/guideLayout";

/** Same approach as Header: only the font-variable classes (`guideFontClass`), never
 *  `guide-scope` itself, so guide.css's scoped rules (h1-h4 sizing, base font-size/colour)
 *  never leak in — the footer stays its own component, just with these fonts in scope. */
const MONO_STYLE = { fontFamily: "var(--font-dm-mono)" };
const BODY_STYLE = { fontFamily: "var(--font-dm-sans)" };
const COL_HEADING_CLASS = "text-[11px] font-normal uppercase tracking-[0.14em] text-[#6f7d62]";
const COL_LINK_CLASS = "block py-[5px] text-[15px] text-[#3c4a30] transition-colors hover:text-[#15200d]";

const toolLinks = [
  { label: "Photo Quote Maker", href: "/photo-quote-maker" },
  { label: "Photo Overlay Editor", href: "/photo-overlay-editor" },
  { label: "Polka Dot Generator", href: "/polka-dot" },
  { label: "Geometric Pattern Generator", href: "/geometric-pattern-generator" },
];

const learnLinks = [
  { label: "Color matching", href: "/#engine" },
  { label: "Why DottyPic", href: "/#why" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

/** Decorative only, same as the mockup's own `<a href="#">` — the site has no working
 *  language switcher yet, so this doesn't pretend to be one. */
const languageLinks = [
  { label: "English", href: "#" },
  { label: "日本語", href: "#" },
  { label: "Bahasa Indonesia", href: "#" },
];

function FootCol({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className={COL_HEADING_CLASS} style={MONO_STYLE}>
        {heading}
      </h4>
      {links.map(({ label, href }) => (
        <Link key={label} href={href} className={COL_LINK_CLASS} style={BODY_STYLE}>
          {label}
        </Link>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className={`${guideFontClass} border-t border-[#e3e9d8] bg-white`}>
      <div className={`${GUIDE_WRAP} py-14`}>
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-[60px]">
          {/* Brand */}
          <div className="max-w-[280px]">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="Dottypic" width={44} height={44} className="rounded" />
              <span className="text-[#1a1a2e] text-[24px] font-extrabold tracking-[-0.15px]">
                Dottypic
              </span>
            </Link>
            <p className="mt-[14px] text-[14.5px] text-[#6f7d62]" style={BODY_STYLE}>
              A free aesthetic photo editor. Small, easy tools that make anything look put
              together. No sign up, no watermark.
            </p>
          </div>

          <FootCol heading="Tools" links={toolLinks} />
          <FootCol heading="Learn" links={learnLinks} />
          <FootCol heading="Language" links={languageLinks} />
        </div>

        <div
          className="mt-[46px] flex items-center justify-between border-t border-[#e3e9d8] pt-6 text-xs text-[#6f7d62]"
          style={MONO_STYLE}
        >
          <span>&copy; {new Date().getFullYear()} DottyPic</span>
          <span className="flex items-center gap-1.5">
            <Link href="/privacy" className="transition-colors hover:text-[#15200d]">
              Privacy
            </Link>
            <span aria-hidden>&middot;</span>
            <Link href="/terms" className="transition-colors hover:text-[#15200d]">
              Terms
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
