import Link from "next/link";
import Image from "next/image";

const supportLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  return (
    <footer
      className="bg-black"
      style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="Paper Dots"
                width={24}
                height={24}
                className="rounded"
              />
              <span
                className="text-white text-[15px] font-medium"
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  letterSpacing: "-0.15px",
                }}
              >
                Paper Dots
              </span>
            </Link>
            <p
              className="text-[14px] leading-[1.6] max-w-[260px]"
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                color: "#a6a6a6",
              }}
            >
              Decorate your photos with hand-drawn paper textures and scattered
              dots.
            </p>
          </div>

          {/* Support */}
          <div>
            <h3
              className="text-[13px] font-medium mb-4"
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                color: "#ffffff",
                letterSpacing: "-0.1px",
              }}
            >
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[14px] transition-colors hover:text-white"
                    style={{
                      fontFamily: "var(--font-inter), system-ui, sans-serif",
                      color: "#a6a6a6",
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3
              className="text-[13px] font-medium mb-4"
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                color: "#ffffff",
                letterSpacing: "-0.1px",
              }}
            >
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[14px] transition-colors hover:text-white"
                    style={{
                      fontFamily: "var(--font-inter), system-ui, sans-serif",
                      color: "#a6a6a6",
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p
            className="text-[13px]"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              color: "#a6a6a6",
            }}
          >
            &copy; {new Date().getFullYear()} Paper Dots. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
