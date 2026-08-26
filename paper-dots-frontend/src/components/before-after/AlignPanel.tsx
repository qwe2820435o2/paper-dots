"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAfterScale, setAfterRotation, resetAfterTransform } from "@/store/slices/beforeAfterSlice";

/** Rendered while the "align" tab is open — `BeforeAfterApp` puts the canvas into its dedicated
 *  align-mode overlay for as long as this tab stays active (see Canvas.tsx). Position itself is
 *  dragged directly on the canvas; this panel only holds scale/rotation/reset. */
export default function AlignPanel() {
    const t = useTranslations("editor.beforeAfter.align");
    const dispatch = useAppDispatch();
    const transform = useAppSelector((s) => s.beforeAfter.afterTransform);

    return (
        <div className="p-4 flex flex-col gap-4">
            <p className="text-[12px] text-[#64748b] leading-[1.5]">{t("hint")}</p>

            <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                    <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">{t("scale")}</label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{Math.round(transform.scale * 100)}%</span>
                </div>
                <Slider
                    min={50}
                    max={200}
                    step={1}
                    value={[Math.round(transform.scale * 100)]}
                    onValueChange={(v) => dispatch(setAfterScale(v[0] / 100))}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                    <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">{t("rotation")}</label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{transform.rotationDeg}°</span>
                </div>
                <Slider
                    min={-45}
                    max={45}
                    step={1}
                    value={[transform.rotationDeg]}
                    onValueChange={(v) => dispatch(setAfterRotation(v[0]))}
                />
            </div>

            <button
                type="button"
                onClick={() => dispatch(resetAfterTransform())}
                className="text-[13px] font-medium py-2 rounded-full border border-[#D2EAAA] text-[#64748b] hover:bg-[#F4FAE8] hover:text-[#1a1a2e] transition-colors"
            >
                {t("reset")}
            </button>
        </div>
    );
}
