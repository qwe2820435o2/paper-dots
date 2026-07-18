"use client";

import { RotateCcw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setBackgroundColor, setFrontColor, resetGeometric } from "@/store/slices/geometricSlice";
import ColorPicker from "@/components/decorate/ColorPicker";

export default function ColorControls() {
    const dispatch = useAppDispatch();
    const config = useAppSelector((s) => s.geometric);

    return (
        <div className="px-4 py-4 flex flex-col gap-5">
            {/* Reset all */}
            <div className="flex justify-end -mb-2">
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
