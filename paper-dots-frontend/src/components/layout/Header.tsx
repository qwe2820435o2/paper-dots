"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const isHome = usePathname() === "/";

  return (
    <header className={isHome
      ? "absolute top-0 left-0 right-0 z-50 border-b border-transparent"
      : "sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-foreground/10"
    }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <Image src="/logo.png" alt="Paper Dots" width={24} height={24} className="rounded" />
            <span className="font-serif font-semibold text-foreground text-lg">Paper Dots</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
