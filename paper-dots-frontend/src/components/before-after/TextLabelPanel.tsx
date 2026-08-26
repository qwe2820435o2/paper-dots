"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import ColorPicker from "@/components/decorate/ColorPicker";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLabelText, setLabelColor, setLabelFontSize } from "@/store/slices/beforeAfterSlice";

/** Rendered while the "text" tab is open in `BeforeAfterApp`'s single-panel shell. */
export default function TextLabelPanel() {
    const t = useTranslations("editor.beforeAfter");
    const tCommon = useTranslations("editor.common");
    const dispatch = useAppDispatch();
    const label = useAppSelector((s) => s.beforeAfter.label);

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">
                        {t("textLabel")}
                    </label>
                    {label.text && (
                        <button
                            type="button"
                            onClick={() => dispatch(setLabelText(""))}
                            className="flex items-center gap-1 text-[11px] text-[#9CA3AF] hover:text-[#1a1a2e]"
                        >
                            <X size={12} />
                            {t("removeText")}
                        </button>
                    )}
                </div>
                <input
                    value={label.text}
                    onChange={(e) => dispatch(setLabelText(e.target.value))}
                    placeholder={t("textPlaceholder")}
                    className="w-full px-3 py-2 rounded-lg border border-[#D2EAAA] bg-white text-[14px] text-[#1a1a2e] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#C5E89A] focus:ring-2 focus:ring-[#E8F5D2]"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                    <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">
                        {tCommon("size")}
                    </label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{label.fontSize}</span>
                </div>
                <Slider
                    min={12}
                    max={96}
                    step={1}
                    value={[label.fontSize]}
                    onValueChange={(v) => dispatch(setLabelFontSize(v[0]))}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">
                    {tCommon("color")}
                </label>
                <ColorPicker color={label.color} onChange={(hex) => dispatch(setLabelColor(hex))} label={t("textLabel")} />
            </div>
        </div>
    );
}
