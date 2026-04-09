"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-[#080808]/90 backdrop-blur-md border-b border-white/[0.12]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/logo.png" alt="Paper Dots" width={22} height={22} className="rounded" />
            <span
              className="text-white text-[15px] font-medium tracking-[-0.15px]"
              style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
            >
              Paper Dots
            </span>
          </Link>

          <button
            onClick={() => router.push("/decorate")}
            className="text-black text-[14px] font-medium px-4 py-2 rounded-[100px] bg-white transition-opacity hover:opacity-80 active:opacity-60 cursor-pointer"
            style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            Try it free
          </button>
        </div>
      </div>
    </header>
  );
}
