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
    <footer className="bg-[#F8FAFC] border-t border-slate-200">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="Dottypic"
                width={44}
                height={44}
                className="rounded"
              />
              <span className="text-[#1a1a2e] text-[24px] font-medium tracking-[-0.15px]">
                Dottypic
              </span>
            </Link>
            <p className="text-[14px] leading-[1.6] max-w-[260px] text-[#64748b]">
              Decorate your photos with hand-drawn paper textures and scattered
              dots. Free and easy to use.
            </p>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[13px] font-semibold mb-4 text-[#1a1a2e] tracking-[-0.1px]">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[14px] text-[#64748b] hover:text-[#1a1a2e] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[13px] font-semibold mb-4 text-[#1a1a2e] tracking-[-0.1px]">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[14px] text-[#64748b] hover:text-[#1a1a2e] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200">
          <p className="text-[13px] text-[#64748b]">
            &copy; {new Date().getFullYear()} Dottypic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
