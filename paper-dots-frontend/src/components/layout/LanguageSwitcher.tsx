"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES, LOCALE_META, type AppLocale } from "@/i18n/locales";

const LANG_STYLE = { fontFamily: "var(--font-dm-mono)" };

interface Props {
    /** `dropdown` is the desktop popover; `inline` is a flat row for the mobile sheet, where a
     *  popover would just be a menu inside a menu. */
    variant?: "dropdown" | "inline";
    onSwitch?: () => void;
}

export default function LanguageSwitcher({ variant = "dropdown", onSwitch }: Props) {
    const t = useTranslations("header");
    const locale = useLocale() as AppLocale;
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const rootRef = useRef<HTMLDivElement>(null);

    /** Click-driven rather than hover-driven like the header's Tools menu: hover would leave the
     *  control unusable for touch and keyboard at desktop widths, where the inline variant is
     *  not rendered. */
    useEffect(() => {
        if (!open) return;

        function onPointerDown(event: PointerEvent) {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        }
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") setOpen(false);
        }

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    /** `pathname` here comes from `@/i18n/navigation`, so it is already stripped of the locale
     *  prefix — passing it straight back with a new `locale` keeps the visitor on the same page
     *  instead of dropping them on the home page. */
    function switchTo(next: AppLocale) {
        setOpen(false);
        onSwitch?.();
        if (next === locale) return;
        startTransition(() => {
            router.replace(pathname, { locale: next });
        });
    }

    if (variant === "inline") {
        return (
            <div className="flex items-center gap-2" style={LANG_STYLE}>
                {LOCALES.map((code) => (
                    <button
                        key={code}
                        type="button"
                        onClick={() => switchTo(code)}
                        aria-current={code === locale ? "true" : undefined}
                        className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
                            code === locale
                                ? "border-[#15200d] bg-[#c5e89a] text-[#15200d]"
                                : "border-[#e3e9d8] bg-white text-[#3c4a30] hover:border-[#15200d]"
                        }`}
                    >
                        {LOCALE_META[code].label}
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                className="inline-flex items-center gap-[7px] rounded-full border border-[#e3e9d8] bg-white px-3.5 py-2 text-[13px] text-[#3c4a30] transition-colors hover:border-[#15200d]"
                style={LANG_STYLE}
                aria-label={t("changeLanguage")}
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen((v) => !v)}
                disabled={isPending}
            >
                <Globe size={14} strokeWidth={1.4} />
                {LOCALE_META[locale].label}
                <ChevronDown
                    size={9}
                    strokeWidth={1.6}
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {open && (
                <div className="absolute top-full right-0 pt-2">
                    <div
                        role="menu"
                        className="min-w-[104px] rounded-xl border border-[#D2EAAA] bg-white py-2 shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                        style={LANG_STYLE}
                    >
                        {LOCALES.map((code) => (
                            <button
                                key={code}
                                type="button"
                                role="menuitem"
                                onClick={() => switchTo(code)}
                                className={`block w-full px-4 py-2 text-left text-[13px] transition-colors hover:bg-[#F4FAE8] ${
                                    code === locale ? "font-medium text-[#15200d]" : "text-[#3c4a30]"
                                }`}
                            >
                                {LOCALE_META[code].label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
