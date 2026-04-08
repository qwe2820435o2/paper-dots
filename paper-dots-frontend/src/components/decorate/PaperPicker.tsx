"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PAPERS } from "@/lib/papers";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPaperId } from "@/store/slices/decorateSlice";

export default function PaperPicker() {
    const dispatch = useAppDispatch();
    const current = useAppSelector((s) => s.decorate.paperId);
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors"
            >
                <span
                    className="text-[13px] font-medium text-white"
                    style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
                >
                    Paper
                </span>
                {isOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" style={{ color: "#a6a6a6" }} />
                ) : (
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: "#a6a6a6" }} />
                )}
            </button>
            {isOpen && (
                <div className="px-4 pb-4">
                    <div className="grid grid-cols-3 gap-2">
                        {PAPERS.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => dispatch(setPaperId(p.id))}
                                className="aspect-square flex items-end justify-center pb-1 text-[10px] transition-all rounded-[6px] overflow-hidden"
                                style={
                                    current === p.id
                                        ? {
                                              backgroundImage: p.src
                                                  ? `url(${p.src})`
                                                  : undefined,
                                              backgroundSize: "cover",
                                              backgroundColor: "#fafafa",
                                              boxShadow:
                                                  "rgba(0, 153, 255, 0.7) 0px 0px 0px 2px",
                                          }
                                        : {
                                              backgroundImage: p.src
                                                  ? `url(${p.src})`
                                                  : undefined,
                                              backgroundSize: "cover",
                                              backgroundColor: "#fafafa",
                                              boxShadow:
                                                  "rgba(255, 255, 255, 0.12) 0px 0px 0px 1px",
                                          }
                                }
                                aria-pressed={current === p.id}
                            >
                                <span
                                    className="px-1 rounded-sm text-[10px]"
                                    style={{
                                        fontFamily:
                                            "var(--font-inter), system-ui, sans-serif",
                                        background: "rgba(0,0,0,0.6)",
                                        color: "#ffffff",
                                    }}
                                >
                                    {p.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
