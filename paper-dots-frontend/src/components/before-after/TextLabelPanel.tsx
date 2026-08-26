"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import ColorPicker from "@/components/decorate/ColorPicker";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setLabelText,
    setLabelColor,
    setLabelFontSize,
    setLabelPosition,
} from "@/store/slices/beforeAfterSlice";

/** Caption length cap. The canvas wraps anything wider than `LABEL_WIDTH_RATIO` of the frame,
 *  so this only exists to stop a caption from growing into a paragraph that covers the photo. */
const MAX_LABEL_LENGTH = 60;

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
                    maxLength={MAX_LABEL_LENGTH}
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

            {/* The caption is dragged on the canvas, which a keyboard can't reach — Konva shapes
                take no focus and no key events. These mirror the same two values as real
                controls. Hidden until there is a caption, since there is nothing to place. */}
            {label.text && (
                <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">
                        {t("labelPosition")}
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-[11px] text-[#9CA3AF]">{tCommon("horizontal")}</span>
                        <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[Math.round(label.xPct)]}
                            onValueChange={(v) => dispatch(setLabelPosition({ xPct: v[0], yPct: label.yPct }))}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-[11px] text-[#9CA3AF]">{tCommon("vertical")}</span>
                        <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[Math.round(label.yPct)]}
                            onValueChange={(v) => dispatch(setLabelPosition({ xPct: label.xPct, yPct: v[0] }))}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
