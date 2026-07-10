"use client";

import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setArrangement,
    setDotSize,
    setSpacing,
    setDotColor,
    setBackgroundColor,
    setOpacity,
    resetPolkaDot,
} from "@/store/slices/polkaDotSlice";
import type { Arrangement } from "@/lib/polkaDotGrid";
import ColorPicker from "@/components/decorate/ColorPicker";
import IconUploader from "./IconUploader";

const ARRANGEMENTS: { value: Arrangement; label: string }[] = [
    { value: "square", label: "Square" },
    { value: "diagonal", label: "Diagonal" },
];

export default function GridControls() {
    const dispatch = useAppDispatch();
    const config = useAppSelector((s) => s.polkaDot);

    return (
        <div className="px-4 py-4 flex flex-col gap-5">
            {/* Reset all */}
            <div className="flex justify-end -mb-2">
                <button
                    type="button"
                    onClick={() => dispatch(resetPolkaDot())}
                    className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg transition-colors text-[#64748b] bg-[#F4FAE8] hover:bg-[#E8F5D2] text-[11px] font-medium"
                >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    Reset all
                </button>
            </div>

            {/* Arrangement */}
            <div>
                <label className="block text-[11px] uppercase mb-2 text-[#64748b] tracking-[0.08em]">
                    Arrangement
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                    {ARRANGEMENTS.map((a) => {
                        const selected = config.arrangement === a.value;
                        return (
                            <button
                                key={a.value}
                                type="button"
                                onClick={() => dispatch(setArrangement(a.value))}
                                aria-pressed={selected}
                                className="min-h-[36px] py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                                style={{
                                    color: selected ? "#C5E89A" : "#64748b",
                                    background: selected ? "#E8F5D2" : "#F4FAE8",
                                    boxShadow: selected
                                        ? "#C5E89A 0px 0px 0px 1.5px"
                                        : "#D2EAAA 0px 0px 0px 1px",
                                }}
                            >
                                {a.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Shape */}
            <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Shape</label>
                <IconUploader />
            </div>

            {/* Dot / Icon Size */}
            <div>
                <div className="flex items-baseline justify-between mb-2">
                    <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">
                        {config.iconUrl ? "Icon Size" : "Dot Size"}
                    </label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{config.dotSize}</span>
                </div>
                <Slider
                    min={2}
                    max={100}
                    step={1}
                    value={[config.dotSize]}
                    onValueChange={(v) => dispatch(setDotSize(v[0]))}
                />
            </div>

            {/* Spacing */}
            <div>
                <div className="flex items-baseline justify-between mb-2">
                    <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Spacing</label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{config.spacing}</span>
                </div>
                <Slider
                    min={4}
                    max={200}
                    step={1}
                    value={[config.spacing]}
                    onValueChange={(v) => dispatch(setSpacing(v[0]))}
                />
            </div>

            {/* Opacity */}
            <div>
                <div className="flex items-baseline justify-between mb-2">
                    <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Opacity</label>
                    <span className="text-[12px] tabular-nums text-[#64748b]">{config.opacity}</span>
                </div>
                <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[config.opacity]}
                    onValueChange={(v) => dispatch(setOpacity(v[0]))}
                />
            </div>

            {/* Dot Color (not applicable when a custom icon supplies its own colors) */}
            {!config.iconUrl && (
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Dot Color</label>
                    <ColorPicker color={config.dotColor} onChange={(hex) => dispatch(setDotColor(hex))} />
                </div>
            )}

            {/* Background Color */}
            <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Background Color</label>
                <ColorPicker
                    color={config.backgroundColor}
                    onChange={(hex) => dispatch(setBackgroundColor(hex))}
                />
            </div>
        </div>
    );
}
