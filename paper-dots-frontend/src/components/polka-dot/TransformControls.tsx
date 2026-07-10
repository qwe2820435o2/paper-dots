"use client";

import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setRotation, setSkewX, setSkewY, setZoom, resetTransform } from "@/store/slices/polkaDotSlice";

export default function TransformControls() {
    const dispatch = useAppDispatch();
    const config = useAppSelector((s) => s.polkaDot);

    return (
        <div className="px-4 py-4 flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Transform</label>
                <button
                    type="button"
                    onClick={() => dispatch(resetTransform())}
                    className="px-2.5 h-7 rounded-lg transition-colors text-[#C5E89A] bg-[#E8F5D2] hover:bg-[#d5edba] text-[11px] font-medium"
                >
                    Reset Transform
                </button>
            </div>

            {/* Rotation */}
            <div>
                <div className="flex items-baseline justify-between mb-2">
                    <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Rotation</label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{config.rotation}°</span>
                </div>
                <Slider
                    min={-180}
                    max={180}
                    step={1}
                    value={[config.rotation]}
                    onValueChange={(v) => dispatch(setRotation(v[0]))}
                />
            </div>

            {/* Skew X */}
            <div>
                <div className="flex items-baseline justify-between mb-2">
                    <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Skew X</label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{config.skewX}°</span>
                </div>
                <Slider
                    min={-60}
                    max={60}
                    step={1}
                    value={[config.skewX]}
                    onValueChange={(v) => dispatch(setSkewX(v[0]))}
                />
            </div>

            {/* Skew Y */}
            <div>
                <div className="flex items-baseline justify-between mb-2">
                    <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Skew Y</label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{config.skewY}°</span>
                </div>
                <Slider
                    min={-60}
                    max={60}
                    step={1}
                    value={[config.skewY]}
                    onValueChange={(v) => dispatch(setSkewY(v[0]))}
                />
            </div>

            {/* Zoom */}
            <div>
                <div className="flex items-baseline justify-between mb-2">
                    <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Zoom</label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{config.zoom.toFixed(2)}x</span>
                </div>
                <Slider
                    min={0.25}
                    max={3}
                    step={0.05}
                    value={[config.zoom]}
                    onValueChange={(v) => dispatch(setZoom(v[0]))}
                />
            </div>
        </div>
    );
}
