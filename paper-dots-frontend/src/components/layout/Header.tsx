"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";
import { CREATE_TOOLS, type CreateTool } from "@/lib/tools";
import { guideFontClass } from "@/lib/fonts";
import { GUIDE_WRAP } from "@/components/guide/guideLayout";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import UploadPhotoButton from "@/components/common/UploadPhotoButton";

/** Nav-row typography borrows the guide pages' DM Sans / DM Mono / Bricolage Grotesque faces.
 *  Only `guideFontClass` (the three CSS-variable classes) is applied, never `guide-scope`
 *  itself, so none of guide.css's scoped rules (background, base font-size, h1-h4 sizing)
 *  leak into the header — it stays a normal component, just with these font variables in scope. */
const NAV_LINK_STYLE = { fontFamily: "var(--font-dm-sans)" };
const CTA_STYLE = { fontFamily: "var(--font-bricolage)" };
const NAV_LINK_CLASS = "text-[15.5px] font-medium text-[#3c4a30] transition-colors hover:text-[#15200d]";

interface NavLink {
    /** Stable across locales — used for React keys and dropdown open-state, which a
     *  translated label cannot be. */
    id: string;
    labelKey: string;
    href: string;
    children?: CreateTool[];
}

const navLinks: NavLink[] = [
    {
        id: "tools",
        labelKey: "navTools",
        href: "/#tools",
        children: CREATE_TOOLS,
    },
    {
        id: "blog",
        labelKey: "navBlog",
        href: "/blog",
    },
];

export default function Header() {
    const t = useTranslations("header");
    const tTools = useTranslations("tools");
    const [menuOpen, setMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    return (
        <header className={`${guideFontClass} sticky top-0 z-50 border-b border-[#e3e9d8] bg-[#fbfcf7]/[0.86] backdrop-blur-md`}>
            <div className={GUIDE_WRAP}>
                <div className="flex h-[74px] items-center gap-[34px]">
                    <Link href="/" className="flex items-center shrink-0">
                        <Image src="/logo-dark.svg" alt="Dottypic" width={176} height={32} className="h-8 w-auto" />
                    </Link>

                    {/* Desktop nav */}
                    <nav className="ml-3 hidden items-center gap-[26px] md:flex">
                        {navLinks.map((item) => {
                            if (!item.children) {
                                return (
                                    <Link key={item.id} href={item.href} className={NAV_LINK_CLASS} style={NAV_LINK_STYLE}>
                                        {t(item.labelKey)}
                                    </Link>
                                );
                            }
                            const isOpen = openDropdown === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className="relative"
                                    onMouseEnter={() => setOpenDropdown(item.id)}
                                    onMouseLeave={() => setOpenDropdown(null)}
                                >
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-1 ${NAV_LINK_CLASS}`}
                                        style={NAV_LINK_STYLE}
                                    >
                                        {t(item.labelKey)}
                                        <ChevronDown
                                            size={14}
                                            strokeWidth={2}
                                            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                                        />
                                    </Link>
                                    {isOpen && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                                            <div className="min-w-[220px] bg-white rounded-xl border border-[#D2EAAA] shadow-[0_8px_24px_rgba(15,23,42,0.08)] py-2">
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.key}
                                                        href={child.href}
                                                        className="block px-4 py-2 hover:bg-[#F4FAE8] transition-colors"
                                                        onClick={() => setOpenDropdown(null)}
                                                    >
                                                        <div className="text-[14px] font-medium text-[#1a1a2e]">
                                                            {tTools(`${child.key}.label`)}
                                                        </div>
                                                        <div className="text-[11px] text-[#9CA3AF] leading-[1.5] mt-0.5">
                                                            {tTools(`${child.key}.navDescription`)}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden items-center gap-3.5 md:ml-auto md:flex">
                        <LanguageSwitcher />
                        <UploadPhotoButton
                            className="inline-flex items-center gap-2 rounded-full border-2 border-[#15200d] bg-[#c5e89a] px-[22px] py-[11px] text-[15px] font-bold text-[#15200d] shadow-[0_4px_0_#15200d] transition-all hover:translate-y-[3px] hover:bg-[#d5f0ae] hover:shadow-[0_2px_0_#15200d] active:translate-y-[5px] active:shadow-none cursor-pointer"
                            trackId="header-cta"
                            target="dot"
                        >
                            <span style={CTA_STYLE}>{t("cta")}</span>
                        </UploadPhotoButton>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="ml-auto p-2 text-[#15200d] md:hidden"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={t("toggleMenu")}
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-[#e3e9d8] px-5 py-4">
                    <nav className="flex flex-col gap-1">
                        {navLinks.map((item) => {
                            if (!item.children) {
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`py-2 ${NAV_LINK_CLASS}`}
                                        style={NAV_LINK_STYLE}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {t(item.labelKey)}
                                    </Link>
                                );
                            }
                            return (
                                <div key={item.id} className="flex flex-col">
                                    <span className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-[0.06em] pt-3 pb-1">
                                        {t(item.labelKey)}
                                    </span>
                                    {item.children.map((child) => (
                                        <Link
                                            key={child.key}
                                            href={child.href}
                                            className="text-[15px] text-[#1a1a2e] py-2 pl-2 hover:text-[#9ED06C] transition-colors"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            {tTools(`${child.key}.label`)}
                                        </Link>
                                    ))}
                                </div>
                            );
                        })}
                        <UploadPhotoButton
                            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#15200d] bg-[#c5e89a] px-5 py-2.5 text-[14px] font-bold text-[#15200d] shadow-[0_4px_0_#15200d] transition-colors hover:bg-[#d5f0ae] cursor-pointer"
                            trackId="header-cta-mobile"
                            target="dot"
                            onBeforeNavigate={() => setMenuOpen(false)}
                        >
                            <span style={CTA_STYLE}>{t("cta")}</span>
                        </UploadPhotoButton>
                        <div className="mt-4 border-t border-[#e3e9d8] pt-4">
                            <LanguageSwitcher variant="inline" onSwitch={() => setMenuOpen(false)} />
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
