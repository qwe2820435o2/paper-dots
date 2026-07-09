"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";

interface NavChild {
    label: string;
    href: string;
    description?: string;
}

interface NavLink {
    label: string;
    href: string;
    children?: NavChild[];
}

const navLinks: NavLink[] = [
    {
        label: "Create",
        href: "/decorate",
        children: [
            { label: "Dot", href: "/decorate", description: "Decorate a photo with playful dots" },
            { label: "Moment Card", href: "/moment-card", description: "Turn a photo into a color-card" },
            { label: "Polka Dot", href: "/polka-dot", description: "Generate a seamless polka dot background" },
        ],
    },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <Image src="/logo.png" alt="Dottypic" width={44} height={44} className="rounded" />
                        <span className="text-[#1a1a2e] text-[24px] font-medium tracking-[-0.15px]">
                            Dottypic
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((item) => {
                            if (!item.children) {
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="text-[15px] text-[#64748b] hover:text-[#1a1a2e] transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                );
                            }
                            const isOpen = openDropdown === item.label;
                            return (
                                <div
                                    key={item.label}
                                    className="relative"
                                    onMouseEnter={() => setOpenDropdown(item.label)}
                                    onMouseLeave={() => setOpenDropdown(null)}
                                >
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-1 text-[15px] text-[#64748b] hover:text-[#1a1a2e] transition-colors"
                                    >
                                        {item.label}
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
                                                        key={child.label}
                                                        href={child.href}
                                                        className="block px-4 py-2 hover:bg-[#F4FAE8] transition-colors"
                                                        onClick={() => setOpenDropdown(null)}
                                                    >
                                                        <div className="text-[14px] font-medium text-[#1a1a2e]">
                                                            {child.label}
                                                        </div>
                                                        {child.description && (
                                                            <div className="text-[11px] text-[#9CA3AF] leading-[1.5] mt-0.5">
                                                                {child.description}
                                                            </div>
                                                        )}
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
                    <div className="hidden md:flex items-center">
                        <Link
                            href="/decorate"
                            className="bg-[#C5E89A] text-white text-[14px] font-medium px-5 py-2 rounded-full hover:bg-[#9ED06C] transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 text-[#1a1a2e]"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-slate-200 px-5 py-4">
                    <nav className="flex flex-col gap-1">
                        {navLinks.map((item) => {
                            if (!item.children) {
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="text-[15px] text-[#64748b] hover:text-[#1a1a2e] py-2 transition-colors"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            }
                            return (
                                <div key={item.label} className="flex flex-col">
                                    <span className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-[0.06em] pt-3 pb-1">
                                        {item.label}
                                    </span>
                                    {item.children.map((child) => (
                                        <Link
                                            key={child.label}
                                            href={child.href}
                                            className="text-[15px] text-[#1a1a2e] py-2 pl-2 hover:text-[#9ED06C] transition-colors"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            {child.label}
                                        </Link>
                                    ))}
                                </div>
                            );
                        })}
                        <Link
                            href="/decorate"
                            className="mt-3 bg-[#C5E89A] text-white text-[14px] font-medium px-5 py-2.5 rounded-full text-center hover:bg-[#9ED06C] transition-colors"
                            onClick={() => setMenuOpen(false)}
                        >
                            Get Started
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
