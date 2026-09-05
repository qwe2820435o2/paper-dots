"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTransformOffset, setTransformScale, setTransformRotation, resetTransform } from "@/store/slices/beforeAfterSlice";
import { UploadSlot } from "@/components/before-after/Uploader";
import { resetBeforeAfterEditor, type BeforeAfterSlot } from "@/lib/beforeAfterPhotoUpload";
import ResetAllButton from "@/components/common/ResetAllButton";

/** Rendered while the "images" tab is open: lets the user re-upload either photo and, below
 *  that, crop the one currently selected — a tab switch between "before" and "after" rather
 *  than two copies of every slider, since only one photo is ever being adjusted at a time. */
export default function ImagesPanel() {
    const t = useTranslations("editor.beforeAfter");
    const tCommon = useTranslations("editor.common");
    const dispatch = useAppDispatch();
    const beforeUrl = useAppSelector((s) => s.beforeAfter.beforeUrl);
    const afterUrl = useAppSelector((s) => s.beforeAfter.afterUrl);
    const [selected, setSelected] = useState<BeforeAfterSlot>("before");
    const transform = useAppSelector((s) => (selected === "before" ? s.beforeAfter.beforeTransform : s.beforeAfter.afterTransform));

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
                {(["before", "after"] as const).map((slot) => (
                    <button
                        key={slot}
                        type="button"
                        onClick={() => setSelected(slot)}
                        className={`flex-1 px-3 py-2 rounded-full text-[13px] font-medium transition-colors ${
                            selected === slot
                                ? "bg-[#C5E89A] text-[#15200d]"
                                : "bg-white text-[#9CA3AF] border border-[#D2EAAA] hover:bg-[#F4FAE8] hover:text-[#1a1a2e]"
                        }`}
                    >
                        {t(slot)}
                    </button>
                ))}
            </div>

            <UploadSlot slot={selected} url={selected === "before" ? beforeUrl : afterUrl} label={t(selected)} />

            <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                    <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">{t("images.zoom")}</label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{Math.round(transform.scale * 100)}%</span>
                </div>
                <Slider
                    min={50}
                    max={200}
                    step={1}
                    value={[Math.round(transform.scale * 100)]}
                    onValueChange={(v) => dispatch(setTransformScale({ slot: selected, scale: v[0] / 100 }))}
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-[11px] text-[#9CA3AF]">{tCommon("horizontal")}</span>
                    <Slider
                        min={-50}
                        max={50}
                        step={1}
                        value={[Math.round(transform.offsetXPct)]}
                        onValueChange={(v) => dispatch(setTransformOffset({ slot: selected, xPct: v[0], yPct: transform.offsetYPct }))}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-[11px] text-[#9CA3AF]">{tCommon("vertical")}</span>
                    <Slider
                        min={-50}
                        max={50}
                        step={1}
                        value={[Math.round(transform.offsetYPct)]}
                        onValueChange={(v) => dispatch(setTransformOffset({ slot: selected, xPct: transform.offsetXPct, yPct: v[0] }))}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                    <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">{tCommon("rotation")}</label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{transform.rotationDeg}°</span>
                </div>
                <Slider
                    min={-45}
                    max={45}
                    step={1}
                    value={[transform.rotationDeg]}
                    onValueChange={(v) => dispatch(setTransformRotation({ slot: selected, rotationDeg: v[0] }))}
                />
            </div>

            <button
                type="button"
                onClick={() => dispatch(resetTransform(selected))}
                className="text-[13px] font-medium py-2 rounded-full border border-[#D2EAAA] text-[#64748b] hover:bg-[#F4FAE8] hover:text-[#1a1a2e] transition-colors"
            >
                {t("images.resetCrop")}
            </button>

            <ResetAllButton onReset={() => dispatch(resetBeforeAfterEditor())} />
        </div>
    );
}
