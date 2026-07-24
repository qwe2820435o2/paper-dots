"use client";

import { useState } from "react";
import { Minus, Plus, Grid3x3, LayoutGrid, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setRows,
    setColumns,
    setDensity,
    setSpacing,
    setRotation,
    setOpacity,
    setRandomizeRotation,
    setRandomizeSpacing,
    shuffle,
} from "@/store/slices/geometricSlice";

const MIN_CELLS = 1;
const MAX_CELLS = 12;

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">{label}</label>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onChange(value - 1)}
                    disabled={value <= MIN_CELLS}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors text-[#64748b] bg-[#F4FAE8] hover:bg-[#E8F5D2] disabled:opacity-40"
                >
                    <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center text-[13px] tabular-nums text-[#1a1a2e]">{value}</span>
                <button
                    type="button"
                    onClick={() => onChange(value + 1)}
                    disabled={value >= MAX_CELLS}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors text-[#64748b] bg-[#F4FAE8] hover:bg-[#E8F5D2] disabled:opacity-40"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

function ToggleRow({
    label,
    checked,
    onChange,
    info,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    info?: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
                <span className="text-[13px] text-[#1a1a2e]">{label}</span>
                {info && (
                    <span title={info}>
                        <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    </span>
                )}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${
                    checked ? "bg-[#9ED06C]" : "bg-[#E5E7EB]"
                }`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        checked ? "translate-x-4" : ""
                    }`}
                    style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
                />
            </button>
        </div>
    );
}

function LabeledSlider({
    label,
    value,
    min,
    max,
    step,
    unit,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit: string;
    onChange: (v: number) => void;
}) {
    return (
        <div>
            <div className="flex items-baseline justify-between mb-2">
                <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em]">{label}</label>
                <span className="text-[12px] tabular-nums text-[#64748b]">
                    {value}
                    {unit}
                </span>
            </div>
            <Slider min={min} max={max} step={step} value={[value]} onValueChange={(v) => onChange(v[0])} />
        </div>
    );
}

type GridStyle = "even" | "staggered";

// Mock-only local state below (Grid Style, Duotone Tiles, Unique Nearby Tile) is a static UI
// preview for layout/visual sign-off — it doesn't touch geometricSlice or affect the rendered
// pattern yet. Density/Spacing/Rotation/Opacity/Randomize are wired to real state below.
export default function GridControls() {
    const dispatch = useAppDispatch();
    const config = useAppSelector((s) => s.geometric);

    const [gridStyle, setGridStyle] = useState<GridStyle>("even");
    const [duotoneTiles, setDuotoneTiles] = useState(false);
    const [uniqueNearbyTile, setUniqueNearbyTile] = useState(true);

    // Toggling either direction sets the flag and immediately shuffles so the new
    // uniform-vs-independent-random behavior is visible right away.
    function handleRandomizeRotation(next: boolean) {
        dispatch(setRandomizeRotation(next));
        dispatch(shuffle());
    }

    function handleRandomizeSpacing(next: boolean) {
        dispatch(setRandomizeSpacing(next));
        dispatch(shuffle());
    }

    return (
        <div className="px-4 py-4 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
                <Stepper label="Rows" value={config.rows} onChange={(v) => dispatch(setRows(v))} />
                <Stepper label="Columns" value={config.columns} onChange={(v) => dispatch(setColumns(v))} />
            </div>

            <div className="flex flex-col gap-3 pt-1" style={{ borderTop: "1px solid #D2EAAA" }}>
                <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em] pt-3">Grid Style</label>
                <div className="flex gap-2.5">
                    <button
                        type="button"
                        onClick={() => setGridStyle("even")}
                        className={`w-14 h-14 rounded-lg flex items-center justify-center transition-colors ${
                            gridStyle === "even" ? "bg-[#1a1a2e] text-white" : "bg-[#F4FAE8] text-[#64748b] hover:bg-[#E8F5D2]"
                        }`}
                    >
                        <Grid3x3 className="w-5 h-5" strokeWidth={1.6} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setGridStyle("staggered")}
                        className={`w-14 h-14 rounded-lg flex items-center justify-center transition-colors ${
                            gridStyle === "staggered"
                                ? "bg-[#1a1a2e] text-white"
                                : "bg-[#F4FAE8] text-[#64748b] hover:bg-[#E8F5D2]"
                        }`}
                    >
                        <LayoutGrid className="w-5 h-5" strokeWidth={1.6} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <ToggleRow label="Duotone Tiles" checked={duotoneTiles} onChange={setDuotoneTiles} />
                <ToggleRow
                    label="Unique Nearby Tile"
                    checked={uniqueNearbyTile}
                    onChange={setUniqueNearbyTile}
                    info="Avoids placing the same shape in neighboring cells"
                />
            </div>

            <div className="flex flex-col gap-3 pt-1" style={{ borderTop: "1px solid #D2EAAA" }}>
                <label className="text-[11px] uppercase text-[#64748b] tracking-[0.08em] pt-3">Randomize</label>
                <ToggleRow label="Rotation" checked={config.randomizeRotation} onChange={handleRandomizeRotation} />
                <ToggleRow label="Spacing" checked={config.randomizeSpacing} onChange={handleRandomizeSpacing} />
            </div>

            <div className="flex flex-col gap-5 pt-1" style={{ borderTop: "1px solid #D2EAAA" }}>
                <div className="pt-3">
                    <LabeledSlider
                        label="Density"
                        value={config.density}
                        min={0}
                        max={100}
                        step={1}
                        unit="%"
                        onChange={(v) => dispatch(setDensity(v))}
                    />
                </div>
                <LabeledSlider
                    label="Spacing"
                    value={config.spacing}
                    min={0}
                    max={100}
                    step={1}
                    unit="%"
                    onChange={(v) => dispatch(setSpacing(v))}
                />
                <LabeledSlider
                    label="Rotation"
                    value={config.rotation}
                    min={0}
                    max={360}
                    step={1}
                    unit="°"
                    onChange={(v) => dispatch(setRotation(v))}
                />
                <LabeledSlider
                    label="Opacity"
                    value={config.opacity}
                    min={0}
                    max={100}
                    step={1}
                    unit="%"
                    onChange={(v) => dispatch(setOpacity(v))}
                />
            </div>
        </div>
    );
}
