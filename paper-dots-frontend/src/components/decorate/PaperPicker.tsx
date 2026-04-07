"use client";

import { PAPERS } from "@/lib/papers";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPaperId } from "@/store/slices/decorateSlice";
import { cn } from "@/lib/utils";

export default function PaperPicker() {
    const dispatch = useAppDispatch();
    const current = useAppSelector((s) => s.decorate.paperId);

    return (
        <div className="sketch-border bg-white p-4">
            <h3 className="font-serif text-lg mb-3">Paper</h3>
            <div className="grid grid-cols-3 gap-2">
                {PAPERS.map((p) => (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => dispatch(setPaperId(p.id))}
                        className={cn(
                            "aspect-square border-2 transition-all bg-[#fafafa] flex items-end justify-center pb-1 text-[10px] text-foreground/70",
                            current === p.id
                                ? "border-foreground -translate-y-0.5 shadow-[2px_2px_0_#1a1a1a]"
                                : "border-foreground/20 hover:border-foreground/60",
                        )}
                        style={
                            p.src
                                ? {
                                      backgroundImage: `url(${p.src})`,
                                      backgroundSize: "cover",
                                  }
                                : undefined
                        }
                        aria-pressed={current === p.id}
                    >
                        <span className="bg-white/80 px-1 rounded-sm">{p.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
