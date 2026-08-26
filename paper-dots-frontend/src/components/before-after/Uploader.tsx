"use client";

import { useCallback, useState } from "react";
import { Upload, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    applyBeforeAfterPhoto,
    clearBeforeAfterPhoto,
    resetBeforeAfterEditor,
    type BeforeAfterSlot,
} from "@/lib/beforeAfterPhotoUpload";
import ResetAllButton from "@/components/common/ResetAllButton";
import { hasAfterTransform } from "@/store/slices/beforeAfterSlice";
import UploadDropzoneDots from "@/components/decorate/UploadDropzoneDots";

interface SlotProps {
    slot: BeforeAfterSlot;
    url: string | null;
    label: string;
}

function UploadSlot({ slot, url, label }: SlotProps) {
    const t = useTranslations("editor.common");
    const tToast = useTranslations("editor.toast");
    const dispatch = useAppDispatch();
    const afterTransform = useAppSelector((s) => s.beforeAfter.afterTransform);
    const [dragOver, setDragOver] = useState(false);

    // Swapping a photo drops the alignment (it was calibrated against the photo being replaced).
    // Say so only when there was an alignment to lose — otherwise it is noise on first upload.
    const warnIfAlignmentLost = useCallback(() => {
        if (hasAfterTransform(afterTransform)) toast.info(tToast("alignReset"));
    }, [afterTransform, tToast]);

    const handleFiles = useCallback(
        (files: FileList | null) => {
            const file = files?.[0];
            if (!file || !file.type.startsWith("image/")) return;
            warnIfAlignmentLost();
            dispatch(applyBeforeAfterPhoto(file, slot));
        },
        [dispatch, slot, warnIfAlignmentLost],
    );

    const clear = useCallback(() => {
        warnIfAlignmentLost();
        dispatch(clearBeforeAfterPhoto(slot));
    }, [dispatch, slot, warnIfAlignmentLost]);

    if (url) {
        return (
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-[1.5px] border-[#D2EAAA] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={label} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-[#1a1a2e]">
                    {label}
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <label
                        className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-[#1a1a2e] hover:bg-white cursor-pointer"
                        aria-label={t("replacePhoto")}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFiles(e.target.files)}
                        />
                        <RefreshCw size={12} />
                    </label>
                    <button
                        type="button"
                        onClick={clear}
                        className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-[#1a1a2e] hover:bg-white"
                        aria-label={t("close")}
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <label
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
            }}
            className={`relative w-full aspect-square rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] select-none px-4 overflow-hidden ${
                dragOver
                    ? "border-[1.5px] border-solid border-[#C5E89A] bg-[#F4FAE8] shadow-[rgba(197,232,154,0.2)_0px_0px_32px_0px]"
                    : "border-[1.5px] border-dashed border-[#D2EAAA] bg-white hover:border-[#C5E89A] hover:bg-[#F8FCF2]"
            }`}
        >
            <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />

            <UploadDropzoneDots />

            {/* Same treatment as `PhotoUploader`'s canvas dropzone — icon tile, display-font
                heading, format badges — one step down in size, since two of these sit side by
                side in the space that one of those gets. The slot name stands in for the
                heading: which photo goes where is the only thing that isn't obvious here.
                Below `sm` the two squares are only ~170px across, so everything steps down
                again and the badges drop out rather than overflow the box. */}
            <div
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    dragOver ? "scale-110" : ""
                }`}
                style={{
                    background: dragOver ? "#E8F5D2" : "#F4FAE8",
                    boxShadow: dragOver
                        ? "rgba(197,232,154,0.4) 0px 8px 24px"
                        : "rgba(197,232,154,0.18) 0px 4px 16px",
                }}
            >
                <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-[#9ED06C]" strokeWidth={1.8} />
            </div>

            <div className="relative flex flex-col items-center gap-1.5">
                <p
                    className="text-[14px] sm:text-[16px] font-semibold text-[#1a1a2e] tracking-[-0.2px]"
                    style={{ fontFamily: "var(--font-quicksand), var(--font-nunito), sans-serif" }}
                >
                    {label}
                </p>
                <p className="text-[11px] sm:text-[12px] text-center text-[#64748b] leading-[1.5]">
                    {t("dropImage")}
                </p>
                <div className="hidden sm:flex items-center gap-1 mt-0.5">
                    {["PNG", "JPG", "WEBP"].map((fmt) => (
                        <span
                            key={fmt}
                            className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-[#F4FAE8] text-[#9ED06C] tracking-[0.06em]"
                        >
                            {fmt}
                        </span>
                    ))}
                </div>
            </div>
        </label>
    );
}

interface Props {
    /** Used for the "Photos" tab in the editor's side panel/drawer, where the two slots stack
     *  full-width instead of sitting side by side in a fixed-width grid. */
    compact?: boolean;
}

/** The "Before & After" editor's dual dropzone: two independent slots, each with its own drag
 *  state, upload, and clear/replace controls. Unlike every other tool here, the canvas can't do
 *  anything useful until *both* slots are filled, so this stands in for the canvas area until
 *  then (see BeforeAfterApp) — and is reused, in `compact` form, as the always-reachable "Photos"
 *  tab afterward so a photo can still be swapped out mid-edit. */
export default function BeforeAfterUploader({ compact = false }: Props) {
    const t = useTranslations("editor.beforeAfter");
    const dispatch = useAppDispatch();
    const beforeUrl = useAppSelector((s) => s.beforeAfter.beforeUrl);
    const afterUrl = useAppSelector((s) => s.beforeAfter.afterUrl);

    // Only offered in `compact` form: the full-size variant *is* the empty editor, where there
    // is nothing yet to start over from.
    return (
        <div className={compact ? "p-4 flex flex-col gap-3 w-full" : "grid grid-cols-2 gap-3 w-full max-w-[520px]"}>
            <UploadSlot slot="before" url={beforeUrl} label={t("before")} />
            <UploadSlot slot="after" url={afterUrl} label={t("after")} />
            {compact && <ResetAllButton onReset={() => dispatch(resetBeforeAfterEditor())} />}
        </div>
    );
}
