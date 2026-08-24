import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { CREATE_TOOLS } from "@/lib/tools";

const supportLinks = [
  { key: "contact", href: "/contact" },
];

const legalLinks = [
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
];

export default async function Footer() {
  const t = await getTranslations("footer");
  const tTools = await getTranslations("tools");

  return (
    <footer className="bg-[#F8FAFC] border-t border-slate-200">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center mb-4">
              <Image src="/logo-dark.svg" alt="Dottypic" width={176} height={32} className="h-8 w-auto" />
            </Link>
            <p className="text-[14px] leading-[1.6] max-w-[260px] text-[#64748b]">
              {t("tagline")}
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-[13px] font-semibold mb-4 text-[#1a1a2e] tracking-[-0.1px]">
              {t("tools")}
            </h3>
            <ul className="space-y-3">
              {CREATE_TOOLS.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-[14px] text-[#64748b] hover:text-[#1a1a2e] transition-colors"
                  >
                    {tTools(`${key}.label`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[13px] font-semibold mb-4 text-[#1a1a2e] tracking-[-0.1px]">
              {t("support")}
            </h3>
            <ul className="space-y-3">
              {supportLinks.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-[14px] text-[#64748b] hover:text-[#1a1a2e] transition-colors"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[13px] font-semibold mb-4 text-[#1a1a2e] tracking-[-0.1px]">
              {t("legal")}
            </h3>
            <ul className="space-y-3">
              {legalLinks.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-[14px] text-[#64748b] hover:text-[#1a1a2e] transition-colors"
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200">
          <p className="text-[13px] text-[#64748b]">
            {/* Passed as a string on purpose: a number arg goes through Intl.NumberFormat
                and would render the year with a thousands separator ("2,026"). */}
            {t("copyright", { year: String(new Date().getFullYear()) })}
          </p>
        </div>
      </div>
    </footer>
  );
}
