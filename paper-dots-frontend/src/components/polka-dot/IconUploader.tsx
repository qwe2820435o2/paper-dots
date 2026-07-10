"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import { Upload, X, Circle, Flower2, Diamond, Heart, Star, Crown, Leaf, Moon } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setIcon, clearIcon } from "@/store/slices/polkaDotSlice";
import { SAMPLE_ICONS } from "@/lib/polkaDotSampleIcons";
import { EMOJI_OPTIONS, toDataUrl } from "@/lib/polkaDotEmojis";

const MAX_ICON_BYTES = 10 * 1024 * 1024;

type IconComponent = ComponentType<{ className?: string }>;

const SAMPLE_ICON_GLYPHS: Record<string, IconComponent> = {
    flower: Flower2,
    diamond: Diamond,
    heart: Heart,
    star: Star,
    crown: Crown,
    leaf: Leaf,
    crescent: Moon,
};

function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = src;
    });
}

const selectedTileStyle = { border: "1.5px solid #C5E89A", background: "#E8F5D2", color: "#C5E89A" };
const unselectedTileStyle = { border: "1.5px solid #D2EAAA", background: "white", color: "#9CA3AF" };

export default function IconUploader() {
    const dispatch = useAppDispatch();
    const iconUrl = useAppSelector((s) => s.polkaDot.iconUrl);
    const [dragOver, setDragOver] = useState(false);
    const [emojiDataUrls, setEmojiDataUrls] = useState<Record<string, string>>({});

    // Prefetch + convert every emoji once on mount (small static files, near-instant), so
    // clicking one applies instantly and the current selection can be matched by value.
    useEffect(() => {
        let cancelled = false;
        Promise.all(EMOJI_OPTIONS.map(async (e) => [e.id, await toDataUrl(e.src)] as const))
            .then((pairs) => {
                if (!cancelled) setEmojiDataUrls(Object.fromEntries(pairs));
            })
            .catch(() => {
                /* thumbnails still render from the static path; selection just won't be prefetched */
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const isSampleOrEmoji =
        SAMPLE_ICONS.some((s) => s.dataUrl === iconUrl) || Object.values(emojiDataUrls).includes(iconUrl ?? "");
    const isCustomUpload = !!iconUrl && !isSampleOrEmoji;

    const handleFiles = useCallback(
        async (files: FileList | null) => {
            const file = files?.[0];
            if (!file || !file.type.startsWith("image/")) return;
            if (file.size > MAX_ICON_BYTES) {
                toast.error("Icon must be under 10MB");
                return;
            }
            try {
                const dataUrl = await readFileAsDataUrl(file);
                const img = await loadImage(dataUrl);
                const aspect = img.naturalWidth / img.naturalHeight || 1;
                dispatch(setIcon({ url: dataUrl, aspect }));
            } catch {
                toast.error("Could not read that image");
            }
        },
        [dispatch],
    );

    const handleEmojiClick = useCallback(
        async (emojiId: string, src: string) => {
            try {
                const dataUrl = emojiDataUrls[emojiId] ?? (await toDataUrl(src));
                dispatch(setIcon({ url: dataUrl, aspect: 1 }));
            } catch {
                toast.error("Could not load that emoji");
            }
        },
        [dispatch, emojiDataUrls],
    );

    const dragHandlers = {
        onDragOver: (e: React.DragEvent<HTMLLabelElement>) => {
            e.preventDefault();
            setDragOver(true);
        },
        onDragLeave: () => setDragOver(false),
        onDrop: (e: React.DragEvent<HTMLLabelElement>) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
        },
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Shape quick-picks */}
            <div className="grid grid-cols-4 gap-1.5">
                <button
                    type="button"
                    onClick={() => dispatch(clearIcon())}
                    aria-pressed={!iconUrl}
                    title="Dot"
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                    style={!iconUrl ? selectedTileStyle : unselectedTileStyle}
                >
                    <Circle className="w-5 h-5" />
                </button>

                {SAMPLE_ICONS.map((sample) => {
                    const Icon = SAMPLE_ICON_GLYPHS[sample.id];
                    const selected = iconUrl === sample.dataUrl;
                    return (
                        <button
                            key={sample.id}
                            type="button"
                            onClick={() => dispatch(setIcon({ url: sample.dataUrl, aspect: 1 }))}
                            aria-pressed={selected}
                            title={sample.label}
                            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
                            style={selected ? selectedTileStyle : unselectedTileStyle}
                        >
                            <Icon className="w-5 h-5" />
                        </button>
                    );
                })}
            </div>

            {/* Emoji quick-picks — a horizontal strip so 15 options don't push everything else down */}
            <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase text-[#9CA3AF] tracking-[0.08em]">Emoji</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                    {EMOJI_OPTIONS.map((emoji) => {
                        const selected = !!emojiDataUrls[emoji.id] && iconUrl === emojiDataUrls[emoji.id];
                        return (
                            <button
                                key={emoji.id}
                                type="button"
                                onClick={() => handleEmojiClick(emoji.id, emoji.src)}
                                aria-pressed={selected}
                                title={emoji.label}
                                className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center transition-all"
                                style={selected ? selectedTileStyle : unselectedTileStyle}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={emoji.src} alt={emoji.label} className="w-7 h-7 object-contain" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Upload your own — its own row, separate from the shape/emoji pickers */}
            {isCustomUpload ? (
                <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                    style={{ background: "white", boxShadow: "#D2EAAA 0px 0px 0px 1px" }}
                >
                    <div
                        className="w-9 h-9 rounded-md shrink-0 flex items-center justify-center overflow-hidden"
                        style={{ background: "#F4FAE8" }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={iconUrl} alt="Uploaded icon" className="max-w-full max-h-full object-contain" />
                    </div>
                    <span className="flex-1 min-w-0 text-[12px] text-[#64748b]">Custom icon</span>
                    <button
                        type="button"
                        onClick={() => dispatch(clearIcon())}
                        aria-label="Remove icon"
                        className="p-1.5 rounded-md text-[#9CA3AF] hover:bg-[#F4FAE8] hover:text-[#1a1a2e] transition-colors shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <label
                    {...dragHandlers}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors border-[1.5px] border-dashed ${
                        dragOver ? "border-[#C5E89A] bg-[#F4FAE8]" : "border-[#D2EAAA] bg-white hover:bg-[#F8FCF2]"
                    }`}
                >
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                    <Upload className="w-4 h-4 shrink-0 text-[#9ED06C]" strokeWidth={1.8} />
                    <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#1a1a2e]">Custom Icon</p>
                        <p className="text-[11px] text-[#9CA3AF]">SVG &middot; PNG &middot; JPG &middot; up to 10MB</p>
                    </div>
                </label>
            )}
        </div>
    );
}
