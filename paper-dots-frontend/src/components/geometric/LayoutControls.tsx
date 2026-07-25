"use client";

import { useEffect, useId, useRef } from "react";
import { shallowEqual } from "react-redux";
import { Minus, Plus, LayoutGrid, Grid2x2, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import ToggleChip from "./ToggleChip";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setRows,
    setColumns,
    setGridStyle,
    setDensity,
    setSpacing,
    setRotation,
    setOpacity,
    setRandomizeRotation,
    setRandomizeSpacing,
    shuffle,
    MIN_CELLS,
    MAX_CELLS,
} from "@/store/slices/geometricSlice";

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase text-muted-foreground tracking-[0.08em]">{label}</label>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onChange(value - 1)}
                    disabled={value <= MIN_CELLS}
                    aria-label={`Decrease ${label}`}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors text-muted-foreground bg-muted hover:bg-secondary disabled:opacity-40"
                >
                    <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-5 text-center text-[13px] tabular-nums text-foreground">{value}</span>
                <button
                    type="button"
                    onClick={() => onChange(value + 1)}
                    disabled={value >= MAX_CELLS}
                    aria-label={`Increase ${label}`}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors text-muted-foreground bg-muted hover:bg-secondary disabled:opacity-40"
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
    const labelId = useId();
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
                <span id={labelId} className="text-[13px] text-foreground">
                    {label}
                </span>
                {info && (
                    <span title={info}>
                        <Info className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                    </span>
                )}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-labelledby={labelId}
                onClick={() => onChange(!checked)}
                className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${checked ? "bg-[#9ED06C]" : "bg-gray-200"}`}
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
    // Radix fires onValueChange on every pointer-move tick while dragging, which would otherwise
    // dispatch (and trigger a full SVG rebuild) far more often than the screen can even show a
    // difference. Batching to one dispatch per animation frame keeps the drag feeling just as
    // live while capping the actual work to ~60/s.
    const rafRef = useRef<number | null>(null);
    const pendingRef = useRef<number | null>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    function handleValueChange(v: number[]) {
        pendingRef.current = v[0];
        if (rafRef.current !== null) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            if (pendingRef.current !== null) onChangeRef.current(pendingRef.current);
        });
    }

    return (
        <div>
            <div className="flex items-baseline justify-between mb-2">
                <label className="text-[11px] uppercase text-muted-foreground tracking-[0.08em]">{label}</label>
                <span className="text-[12px] tabular-nums text-muted-foreground">
                    {value}
                    {unit}
                </span>
            </div>
            <Slider min={min} max={max} step={step} value={[value]} onValueChange={handleValueChange} aria-label={label} />
        </div>
    );
}

export default function LayoutControls() {
    const dispatch = useAppDispatch();
    const config = useAppSelector(
        (s) => ({
            rows: s.geometric.rows,
            columns: s.geometric.columns,
            gridStyle: s.geometric.gridStyle,
            density: s.geometric.density,
            spacing: s.geometric.spacing,
            rotation: s.geometric.rotation,
            opacity: s.geometric.opacity,
            randomizeRotation: s.geometric.randomizeRotation,
            randomizeSpacing: s.geometric.randomizeSpacing,
        }),
        shallowEqual,
    );

    // Toggling either direction sets the flag and immediately shuffles so the new
    // behavior is visible right away.
    function handleGridStyle(next: "even" | "compact") {
        dispatch(setGridStyle(next));
        dispatch(shuffle());
    }

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

            <div className="flex flex-col gap-3 pt-1 border-t border-border">
                <label className="text-[11px] uppercase text-muted-foreground tracking-[0.08em] pt-3">Grid Style</label>
                <div className="flex gap-2.5">
                    <ToggleChip
                        selected={config.gridStyle === "even"}
                        onClick={() => handleGridStyle("even")}
                        ariaLabel="Even grid"
                        className="w-11 h-11 rounded-lg flex items-center justify-center"
                        selectedClassName="bg-foreground text-background"
                        unselectedClassName="bg-muted text-muted-foreground hover:bg-secondary"
                    >
                        <LayoutGrid className="w-5 h-5" strokeWidth={1.5} />
                    </ToggleChip>
                    <ToggleChip
                        selected={config.gridStyle === "compact"}
                        onClick={() => handleGridStyle("compact")}
                        ariaLabel="Compact grid"
                        className="w-11 h-11 rounded-lg flex items-center justify-center"
                        selectedClassName="bg-foreground text-background"
                        unselectedClassName="bg-muted text-muted-foreground hover:bg-secondary"
                    >
                        <Grid2x2 className="w-5 h-5" strokeWidth={1.5} />
                    </ToggleChip>
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-1 border-t border-border">
                <label className="text-[11px] uppercase text-muted-foreground tracking-[0.08em] pt-3">Randomize</label>
                <ToggleRow label="Rotation" checked={config.randomizeRotation} onChange={handleRandomizeRotation} />
                <ToggleRow label="Spacing" checked={config.randomizeSpacing} onChange={handleRandomizeSpacing} />
            </div>

            <div className="flex flex-col gap-5 pt-1 border-t border-border">
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
