"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAspectPreset, setCustomAspect, type AspectPreset } from "@/store/slices/beforeAfterSlice";

const PRESETS: { id: Exclude<AspectPreset, "custom">; labelKey: string }[] = [
    { id: "4/5", labelKey: "size.instagram" },
    { id: "9/16", labelKey: "size.tiktok" },
    { id: "16/9", labelKey: "size.website" },
];

/** Rendered while the "size" tab is open. Sets the frame's own aspect ratio — independent of
 *  either photo's dimensions — which every layout then subdivides (see Canvas.tsx). */
export default function SizePanel() {
    const t = useTranslations("editor.beforeAfter");
    const dispatch = useAppDispatch();
    const aspect = useAppSelector((s) => s.beforeAfter.aspect);
    const [width, setWidth] = useState(aspect.width);
    const [height, setHeight] = useState(aspect.height);

    // Keep the custom fields in sync whenever a *different* size takes effect — most notably a
    // preset button, which changes `aspect.preset` without ever touching this component's local
    // state. Keyed on `preset` alone (not width/height) so it fires once when a preset is picked
    // or when a fresh edit here first flips `preset` to "custom", but not on every keystroke
    // after that — a keystroke-keyed sync would fight free typing (e.g. clearing the field to
    // retype a number briefly makes it "invalid", and snapping back to the last Redux value on
    // every render would make that impossible).
    useEffect(() => {
        setWidth(aspect.width);
        setHeight(aspect.height);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aspect.preset]);

    function applyCustom(nextWidth: number, nextHeight: number) {
        if (nextWidth > 0 && nextHeight > 0) dispatch(setCustomAspect({ width: nextWidth, height: nextHeight }));
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
                {PRESETS.map(({ id, labelKey }) => {
                    const active = aspect.preset === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => dispatch(setAspectPreset(id))}
                            className={`flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-xl text-[12px] font-medium border transition-colors ${
                                active
                                    ? "border-[#C5E89A] bg-[#F4FAE8] text-[#1a1a2e]"
                                    : "border-[#D2EAAA] bg-white text-[#9CA3AF] hover:bg-[#F4FAE8] hover:text-[#1a1a2e]"
                            }`}
                        >
                            {t(labelKey)}
                            <span className="text-[10px] text-[#9CA3AF]">{id}</span>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">{t("size.custom")}</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min={200}
                        value={width}
                        onChange={(e) => {
                            const w = Number(e.target.value);
                            setWidth(w);
                            applyCustom(w, height);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-[#D2EAAA] bg-white text-[13px] text-[#1a1a2e] focus:outline-none focus:border-[#C5E89A] focus:ring-2 focus:ring-[#E8F5D2]"
                    />
                    <span className="text-[#9CA3AF]">×</span>
                    <input
                        type="number"
                        min={200}
                        value={height}
                        onChange={(e) => {
                            const h = Number(e.target.value);
                            setHeight(h);
                            applyCustom(width, h);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-[#D2EAAA] bg-white text-[13px] text-[#1a1a2e] focus:outline-none focus:border-[#C5E89A] focus:ring-2 focus:ring-[#E8F5D2]"
                    />
                </div>
            </div>
        </div>
    );
}
