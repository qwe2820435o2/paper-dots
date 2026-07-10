"use client";

import { useState } from "react";
import { Shuffle, Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { applyPreset, applyPalette, shuffleAppearance } from "@/store/slices/polkaDotSlice";
import { POLKA_DOT_PRESETS, POLKA_DOT_PALETTES } from "@/lib/polkaDotPresets";
import PolkaDotPreview from "./PolkaDotPreview";

export default function PresetControls() {
    const dispatch = useAppDispatch();
    const config = useAppSelector((s) => s.polkaDot);
    const [spinning, setSpinning] = useState(false);

    return (
        <div className="px-4 py-4 flex flex-col gap-5">
            {/* Presets */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Presets</label>
                    <button
                        type="button"
                        onClick={() => {
                            dispatch(shuffleAppearance());
                            setSpinning(true);
                        }}
                        onAnimationEnd={() => setSpinning(false)}
                        className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg transition-colors text-[#C5E89A] bg-[#E8F5D2] hover:bg-[#d5edba] text-[11px] font-medium"
                    >
                        <Shuffle className={`w-3.5 h-3.5 shrink-0 ${spinning ? "animate-spin-once" : ""}`} />
                        Shuffle
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {POLKA_DOT_PRESETS.map((preset) => {
                        const selected = config.presetId === preset.id;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => dispatch(applyPreset(preset.id))}
                                className="flex flex-col items-center gap-1"
                            >
                                <div
                                    className="relative w-full aspect-square rounded-lg transition-all"
                                    style={{
                                        boxShadow: selected
                                            ? "#C5E89A 0px 0px 0px 2px"
                                            : "#D2EAAA 0px 0px 0px 1px",
                                    }}
                                >
                                    <div className="w-full h-full rounded-lg overflow-hidden">
                                        <PolkaDotPreview
                                            config={{
                                                arrangement: preset.arrangement,
                                                dotSize: preset.dotSize,
                                                spacing: preset.spacing,
                                                rotation: preset.rotation,
                                                skewX: preset.skewX,
                                                skewY: preset.skewY,
                                                zoom: preset.zoom,
                                                dotColor: config.dotColor,
                                                backgroundColor: config.backgroundColor,
                                                opacity: config.opacity,
                                                iconUrl: config.iconUrl,
                                                iconAspect: config.iconAspect,
                                            }}
                                        />
                                    </div>
                                    {selected && (
                                        <div
                                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                                            style={{ background: "#9ED06C", boxShadow: "0 0 0 1.5px white" }}
                                        >
                                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                                <span
                                    className="text-[10px] truncate max-w-full"
                                    style={{
                                        color: selected ? "#9ED06C" : "#64748b",
                                        fontWeight: selected ? 600 : 400,
                                    }}
                                >
                                    {preset.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Palettes */}
            <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">Palettes</label>
                <div className="flex flex-col gap-2">
                    {POLKA_DOT_PALETTES.map((palette) => {
                        const selected = config.paletteId === palette.id;
                        return (
                            <button
                                key={palette.id}
                                type="button"
                                onClick={() => dispatch(applyPalette(palette.id))}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all"
                                style={{
                                    background: selected ? "#E8F5D2" : "white",
                                    boxShadow: selected
                                        ? "#C5E89A 0px 0px 0px 1.5px"
                                        : "#D2EAAA 0px 0px 0px 1px",
                                }}
                            >
                                <div className="flex -space-x-1.5">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{
                                            backgroundColor: palette.backgroundColor,
                                            boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px",
                                        }}
                                    />
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{
                                            backgroundColor: palette.dotColor,
                                            boxShadow: "rgba(0,0,0,0.08) 0px 0px 0px 1px",
                                        }}
                                    />
                                </div>
                                <span
                                    className="text-[12px]"
                                    style={{ color: selected ? "#C5E89A" : "#64748b" }}
                                >
                                    {palette.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
