"use client";

import { Minus, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setRows, setColumns } from "@/store/slices/geometricSlice";

const MIN_CELLS = 1;
const MAX_CELLS = 12;

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex items-center justify-between">
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

export default function GridControls() {
    const dispatch = useAppDispatch();
    const config = useAppSelector((s) => s.geometric);

    return (
        <div className="px-4 py-4 flex flex-col gap-5">
            <Stepper label="Rows" value={config.rows} onChange={(v) => dispatch(setRows(v))} />
            <Stepper label="Columns" value={config.columns} onChange={(v) => dispatch(setColumns(v))} />
        </div>
    );
}
