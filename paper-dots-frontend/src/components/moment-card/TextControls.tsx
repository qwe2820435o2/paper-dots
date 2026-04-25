"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setSubtitle,
    setTextColorMode,
    setTitle,
    type TextColorMode,
} from "@/store/slices/momentCardSlice";

const COLOR_MODE_OPTIONS: { id: TextColorMode; label: string }[] = [
    { id: "auto", label: "Auto" },
    { id: "dark", label: "Dark" },
    { id: "light", label: "Light" },
];

export default function TextControls() {
    const dispatch = useAppDispatch();
    const title = useAppSelector((s) => s.momentCard.title);
    const subtitle = useAppSelector((s) => s.momentCard.subtitle);
    const textColorMode = useAppSelector((s) => s.momentCard.textColorMode);

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">
                    Title
                </label>
                <input
                    value={title}
                    onChange={(e) => dispatch(setTitle(e.target.value))}
                    placeholder="Moment title"
                    className="w-full px-3 py-2 rounded-lg border border-[#D2EAAA] bg-white text-[14px] text-[#1a1a2e] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#C5E89A] focus:ring-2 focus:ring-[#E8F5D2]"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">
                    Subtitle
                </label>
                <input
                    value={subtitle}
                    onChange={(e) => dispatch(setSubtitle(e.target.value))}
                    placeholder="Tap here to add subtitle"
                    className="w-full px-3 py-2 rounded-lg border border-[#D2EAAA] bg-white text-[14px] text-[#1a1a2e] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#C5E89A] focus:ring-2 focus:ring-[#E8F5D2]"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-[#64748b] tracking-[0.04em]">
                    Text color
                </span>
                <div className="flex items-center gap-1.5 rounded-full bg-[#F4FAE8] p-1">
                    {COLOR_MODE_OPTIONS.map(({ id, label }) => {
                        const active = textColorMode === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => dispatch(setTextColorMode(id))}
                                className={`flex-1 text-[12px] font-medium py-1.5 rounded-full transition-colors ${
                                    active
                                        ? "bg-white text-[#1a1a2e] shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                                        : "text-[#64748b] hover:text-[#1a1a2e]"
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
