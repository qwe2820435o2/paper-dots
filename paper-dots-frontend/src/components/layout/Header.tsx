"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Create", href: "/decorate" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/logo.png" alt="Mochipic" width={22} height={22} className="rounded" />
            <span className="text-[#1a1a2e] text-[15px] font-medium tracking-[-0.15px]">
              Mochipic
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-[15px] text-[#64748b] hover:text-[#1a1a2e] transition-colors"
              >
                {label}
              </Link>
            ))}
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
          <nav className="flex flex-col gap-4">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-[15px] text-[#64748b] hover:text-[#1a1a2e] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/decorate"
              className="bg-[#C5E89A] text-white text-[14px] font-medium px-5 py-2.5 rounded-full text-center hover:bg-[#9ED06C] transition-colors"
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
