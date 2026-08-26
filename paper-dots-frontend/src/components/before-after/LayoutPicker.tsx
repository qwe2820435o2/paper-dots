"use client";

import { useTranslations } from "next-intl";
import { SlidersHorizontal, Columns2, SquareSplitHorizontal, Rows2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setLayoutType, type BeforeAfterLayout } from "@/store/slices/beforeAfterSlice";

const LAYOUTS: { id: BeforeAfterLayout; icon: typeof SlidersHorizontal }[] = [
    { id: "slider", icon: SlidersHorizontal },
    { id: "side-by-side", icon: Columns2 },
    { id: "split", icon: SquareSplitHorizontal },
    { id: "stack", icon: Rows2 },
];

export default function LayoutPicker() {
    const t = useTranslations("editor.beforeAfter.layouts");
    const dispatch = useAppDispatch();
    const layoutType = useAppSelector((s) => s.beforeAfter.layoutType);

    return (
        <div className="p-4 flex items-center justify-center gap-2 flex-wrap">
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
    );
}
