"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PAPERS } from "@/lib/papers";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPaperId } from "@/store/slices/decorateSlice";
import { cn } from "@/lib/utils";

export default function PaperPicker() {
    const dispatch = useAppDispatch();
    const current = useAppSelector((s) => s.decorate.paperId);
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="border-b border-foreground/10">
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-foreground/5 transition-colors"
            >
                <span className="font-serif text-sm">Paper</span>
                {isOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                )}
            </button>
            {isOpen && (
                <div className="px-3 pb-3">
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
            )}
        </div>
    );
}
