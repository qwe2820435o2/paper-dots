"use client";

import { useTranslations } from "next-intl";
import { SlidersHorizontal, Columns2, Rows2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLayoutType, setSliderPosition, setGap, setCanvasBackground, type BeforeAfterLayout } from "@/store/slices/beforeAfterSlice";

const LAYOUTS: { id: BeforeAfterLayout; icon: typeof SlidersHorizontal }[] = [
    { id: "slider", icon: SlidersHorizontal },
    { id: "side-by-side", icon: Columns2 },
    { id: "stack", icon: Rows2 },
];

export default function LayoutPicker() {
    const t = useTranslations("editor.beforeAfter.layouts");
    const tBeforeAfter = useTranslations("editor.beforeAfter");
    const tCommon = useTranslations("editor.common");
    const dispatch = useAppDispatch();
    const layoutType = useAppSelector((s) => s.beforeAfter.layoutType);
    const sliderPosition = useAppSelector((s) => s.beforeAfter.sliderPosition);
    const gap = useAppSelector((s) => s.beforeAfter.gap);
    const canvasBackground = useAppSelector((s) => s.beforeAfter.canvasBackground);

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 flex-wrap">
                {LAYOUTS.map(({ id, icon: Icon }) => {
                    const active = layoutType === id;
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => dispatch(setLayoutType(id))}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-colors ${
                                active
                                    ? "bg-[#C5E89A] text-[#15200d]"
                                    : "bg-white text-[#9CA3AF] border border-[#D2EAAA] hover:bg-[#F4FAE8] hover:text-[#1a1a2e]"
                            }`}
                        >
                            <Icon size={15} strokeWidth={2} />
                            {t(id)}
                        </button>
                    );
                })}
            </div>

            {/* The divider is dragged on the canvas, but a Konva shape can't be tabbed to or nudged
                with a key. This mirrors it as a real focusable control. */}
            {layoutType === "slider" && (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between">
                        <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">
                            {tBeforeAfter("dividerPosition")}
                        </label>
                        <span className="text-[12px] tabular-nums text-[#64748b]">
                            {Math.round(sliderPosition)}%
                        </span>
                    </div>
                    <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[Math.round(sliderPosition)]}
                        onValueChange={(v) => dispatch(setSliderPosition(v[0]))}
                    />
                </div>
            )}

            {layoutType !== "slider" && (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between">
                        <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">
                            {tBeforeAfter("layout.gap")}
                        </label>
                        <span className="text-[12px] tabular-nums text-[#64748b]">{gap}px</span>
                    </div>
                    <Slider min={0} max={48} step={1} value={[gap]} onValueChange={(v) => dispatch(setGap(v[0]))} />
                </div>
            )}

            {/* Only the gap between panels ever shows this color — in "slider" the two photos
                always cover-fit the whole frame, so there is no gap for it to fill. */}
            {layoutType !== "slider" && (
                <div className="flex items-center justify-between gap-2">
                    <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">
                        {tBeforeAfter("layout.canvasBackground")}
                    </label>
                    <input
                        type="color"
                        value={canvasBackground}
                        onChange={(e) => dispatch(setCanvasBackground(e.target.value))}
                        aria-label={tCommon("background")}
                        className="w-9 h-9 rounded-lg border border-[#D2EAAA] bg-white p-0.5 cursor-pointer"
                    />
                </div>
            )}
        </div>
    );
}
