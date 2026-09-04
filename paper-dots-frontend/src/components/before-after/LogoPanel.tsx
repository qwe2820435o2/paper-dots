"use client";

import { useCallback } from "react";
import { Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLogoSize, setLogoPosition, type LogoPosition } from "@/store/slices/beforeAfterSlice";
import { applyBeforeAfterLogo, clearBeforeAfterLogo } from "@/lib/beforeAfterPhotoUpload";

const POSITIONS: { id: LogoPosition; labelKey: string }[] = [
    { id: "top-left", labelKey: "position.topLeft" },
    { id: "top-right", labelKey: "position.topRight" },
    { id: "bottom-left", labelKey: "position.bottomLeft" },
    { id: "bottom-right", labelKey: "position.bottomRight" },
];

/** Rendered while the "logo" tab is open — an optional brand mark baked into the preview and
 *  every export, sized as a percent of the frame so it scales with whatever size is picked. */
export default function LogoPanel() {
    const t = useTranslations("editor.beforeAfter");
    const dispatch = useAppDispatch();
    const logo = useAppSelector((s) => s.beforeAfter.logo);

    const handleFiles = useCallback(
        (files: FileList | null) => {
            const file = files?.[0];
            if (!file || !file.type.startsWith("image/")) return;
            dispatch(applyBeforeAfterLogo(file));
        },
        [dispatch],
    );

    return (
        <div className="p-4 flex flex-col gap-4">
            {logo.url ? (
                <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden border-[1.5px] border-[#D2EAAA] bg-[#F8FCF2] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.url} alt={t("logo.title")} className="max-w-[70%] max-h-[70%] object-contain" />
                    <button
                        type="button"
                        onClick={() => dispatch(clearBeforeAfterLogo())}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-[#1a1a2e] hover:bg-white"
                        aria-label={t("logo.remove")}
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <label className="relative w-full aspect-[3/1] rounded-xl cursor-pointer flex flex-col items-center justify-center gap-1.5 border-[1.5px] border-dashed border-[#D2EAAA] bg-white hover:border-[#C5E89A] hover:bg-[#F8FCF2] transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                    <Upload className="w-5 h-5 text-[#9ED06C]" strokeWidth={1.8} />
                    <span className="text-[13px] font-medium text-[#1a1a2e]">{t("logo.upload")}</span>
                </label>
            )}

            <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                    <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">{t("logo.size")}</label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{logo.sizePct}%</span>
                </div>
                <Slider
                    min={5}
                    max={40}
                    step={1}
                    value={[logo.sizePct]}
                    onValueChange={(v) => dispatch(setLogoSize(v[0]))}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">{t("logo.position")}</label>
                <select
                    value={logo.position}
                    onChange={(e) => dispatch(setLogoPosition(e.target.value as LogoPosition))}
                    className="w-full px-3 py-2 rounded-lg border border-[#D2EAAA] bg-white text-[13px] text-[#1a1a2e] focus:outline-none focus:border-[#C5E89A] focus:ring-2 focus:ring-[#E8F5D2]"
                >
                    {POSITIONS.map(({ id, labelKey }) => (
                        <option key={id} value={id}>
                            {t(labelKey)}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
