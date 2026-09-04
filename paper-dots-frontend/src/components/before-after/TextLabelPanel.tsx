"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import ColorPicker from "@/components/decorate/ColorPicker";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setLabelText,
    setLabelPosition,
    setLabelVisible,
    setLabelFontFamily,
    setLabelFontSize,
    setLabelColor,
    setLabelBackgroundColor,
    setLabelBackgroundOpacity,
    type BeforeAfterSlot,
    type LabelPosition,
} from "@/store/slices/beforeAfterSlice";

/** Caption length cap — purely to stop a caption from growing into a paragraph that covers the
 *  photo; the canvas doesn't wrap these (they sit in a fixed corner, not a flexible box). */
const MAX_LABEL_LENGTH = 60;

const POSITIONS: { id: LabelPosition; labelKey: string }[] = [
    { id: "top-left", labelKey: "position.topLeft" },
    { id: "top-center", labelKey: "position.topCenter" },
    { id: "top-right", labelKey: "position.topRight" },
    { id: "bottom-left", labelKey: "position.bottomLeft" },
    { id: "bottom-center", labelKey: "position.bottomCenter" },
    { id: "bottom-right", labelKey: "position.bottomRight" },
];

const FONTS = ["Arial", "Georgia", "Helvetica", "Courier New"];

/** Rendered while the "text" tab is open. Before and after each get an independent caption
 *  (text + one of six preset positions); font/color/background styling is shared between them
 *  rather than doubled. */
export default function TextLabelPanel() {
    const t = useTranslations("editor.beforeAfter");
    const tCommon = useTranslations("editor.common");
    const dispatch = useAppDispatch();
    const beforeLabel = useAppSelector((s) => s.beforeAfter.beforeLabel);
    const afterLabel = useAppSelector((s) => s.beforeAfter.afterLabel);
    const style = useAppSelector((s) => s.beforeAfter.labelStyle);

    function labelGroup(slot: BeforeAfterSlot) {
        const label = slot === "before" ? beforeLabel : afterLabel;
        return (
            <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">{t(slot)}</label>
                <input
                    value={label.text}
                    onChange={(e) => dispatch(setLabelText({ slot, text: e.target.value }))}
                    maxLength={MAX_LABEL_LENGTH}
                    placeholder={t(slot)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D2EAAA] bg-white text-[14px] text-[#1a1a2e] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#C5E89A] focus:ring-2 focus:ring-[#E8F5D2]"
                />
                <select
                    value={label.position}
                    onChange={(e) => dispatch(setLabelPosition({ slot, position: e.target.value as LabelPosition }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#D2EAAA] bg-white text-[13px] text-[#1a1a2e] focus:outline-none focus:border-[#C5E89A] focus:ring-2 focus:ring-[#E8F5D2]"
                >
                    {POSITIONS.map(({ id, labelKey }) => (
                        <option key={id} value={id}>
                            {t(labelKey)}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">{t("label.showLabels")}</label>
                <button
                    type="button"
                    role="switch"
                    aria-checked={style.visible}
                    onClick={() => dispatch(setLabelVisible(!style.visible))}
                    className={`w-9 h-5 rounded-full relative transition-colors ${style.visible ? "bg-[#9ED06C]" : "bg-[#D8DAE3]"}`}
                >
                    <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                            style.visible ? "translate-x-[18px]" : "translate-x-0.5"
                        }`}
                    />
                </button>
            </div>

            {labelGroup("before")}
            {labelGroup("after")}

            <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">{t("label.fontFamily")}</label>
                <select
                    value={style.fontFamily}
                    onChange={(e) => dispatch(setLabelFontFamily(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[#D2EAAA] bg-white text-[13px] text-[#1a1a2e] focus:outline-none focus:border-[#C5E89A] focus:ring-2 focus:ring-[#E8F5D2]"
                >
                    {FONTS.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                    <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">{tCommon("size")}</label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{style.fontSize}</span>
                </div>
                <Slider
                    min={12}
                    max={96}
                    step={1}
                    value={[style.fontSize]}
                    onValueChange={(v) => dispatch(setLabelFontSize(v[0]))}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">{tCommon("color")}</label>
                <ColorPicker color={style.color} onChange={(hex) => dispatch(setLabelColor(hex))} label={tCommon("color")} />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">{tCommon("background")}</label>
                <ColorPicker
                    color={style.backgroundColor}
                    onChange={(hex) => dispatch(setLabelBackgroundColor(hex))}
                    label={tCommon("background")}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                    <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">{t("label.backgroundOpacity")}</label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{style.backgroundOpacity}%</span>
                </div>
                <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[style.backgroundOpacity]}
                    onValueChange={(v) => dispatch(setLabelBackgroundOpacity(v[0]))}
                />
            </div>
        </div>
    );
}
