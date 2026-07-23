"use client";

import { RotateCcw, Shuffle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setBackgroundColor, setFrontColor, setColorPair, resetGeometric } from "@/store/slices/geometricSlice";
import ColorPicker from "@/components/decorate/ColorPicker";
import { GEOMETRIC_COLOR_PRESETS } from "@/lib/geometricColorPresets";

export default function ColorControls() {
    const dispatch = useAppDispatch();
    const config = useAppSelector((s) => s.geometric);

    const handleRandomColors = () => {
        const preset = GEOMETRIC_COLOR_PRESETS[Math.floor(Math.random() * GEOMETRIC_COLOR_PRESETS.length)];
        dispatch(setColorPair(preset));
    };

    return (
        <div className="px-4 py-4 flex flex-col gap-5">
            {/* Reset all + Use Random Colors */}
            <div className="flex justify-between items-center -mb-2">
                <button
                    type="button"
                    onClick={handleRandomColors}
                    className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg transition-colors text-[#64748b] bg-[#F4FAE8] hover:bg-[#E8F5D2] text-[11px] font-medium"
                >
                    <Shuffle className="w-3.5 h-3.5 shrink-0" />
                    Use Random Colors
                </button>
                <button
                    type="button"
                    onClick={() => dispatch(resetGeometric())}
                    className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg transition-colors text-[#64748b] bg-[#F4FAE8] hover:bg-[#E8F5D2] text-[11px] font-medium"
                >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    Reset all
                </button>
            </div>

            <div className="flex flex-col gap-3">
                <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Presets</label>
                <div className="flex flex-wrap gap-2.5">
                    {GEOMETRIC_COLOR_PRESETS.map((preset, i) => (
                        <button
                            key={i}
                            type="button"
                            title={`${preset.background} / ${preset.front}`}
                            onClick={() => dispatch(setColorPair(preset))}
                            className="shrink-0 w-7 h-7 rounded-full transition-transform hover:scale-110"
                            style={{
                                background: `conic-gradient(${preset.background} 0deg 180deg, ${preset.front} 180deg 360deg)`,
                                boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Background</label>
                <ColorPicker color={config.backgroundColor} onChange={(hex) => dispatch(setBackgroundColor(hex))} />
            </div>

            <div className="flex flex-col gap-3 pt-1" style={{ borderTop: "1px solid #D2EAAA" }}>
                <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em] pt-3">Front</label>
                <ColorPicker color={config.frontColor} onChange={(hex) => dispatch(setFrontColor(hex))} />
            </div>
        </div>
    );
}
