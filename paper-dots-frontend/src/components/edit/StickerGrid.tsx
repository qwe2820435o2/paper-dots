"use client";

import { useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { addSticker, removeSticker } from "@/store/slices/editSlice";
import { getTemplate } from "@/lib/templates";
import {
  STICKERS,
  STICKER_CATEGORIES,
  StickerCategory,
  getStickerDef,
} from "@/lib/stickers";
import type { PlacedSticker } from "@/lib/stickers";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

function generateUid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function StickerGrid() {
  const dispatch = useDispatch();
  const [activeCategory, setActiveCategory] =
    useState<StickerCategory>("hot");
  const placedStickers = useSelector(
    (state: RootState) => state.edit.placedStickers
  );
  const selectedTemplateId = useSelector(
    (state: RootState) => state.edit.selectedTemplateId
  );

  const template = getTemplate(selectedTemplateId);
  const filtered = STICKERS.filter((s) => s.category === activeCategory);

  function handleAddSticker(stickerId: string) {
    const sticker = getStickerDef(stickerId);
    if (!sticker) return;
    const placed: PlacedSticker = {
      uid: generateUid(),
      stickerId,
      x: template.canvasWidth * (0.2 + Math.random() * 0.6),
      y: template.canvasHeight * (0.1 + Math.random() * 0.7),
      scale: 1.0,
      rotation: Math.random() * 20 - 10,
    };
    dispatch(addSticker(placed));
  }

  return (
    <div className="flex flex-col gap-3 p-1 h-full overflow-hidden">
      {/* Category tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg overflow-x-auto scrollbar-none">
        {STICKER_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              "shrink-0 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-150",
              activeCategory === cat.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sticker grid */}
      <div className="grid grid-rows-2 grid-flow-col gap-2 overflow-x-auto pb-3">
        {filtered.map((s) => (
          <button
            key={s.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("stickerId", s.id);
              e.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => handleAddSticker(s.id)}
            className={cn(
              "shrink-0 w-10 h-10 flex items-center justify-center p-1 rounded-xl cursor-grab active:cursor-grabbing",
              "bg-muted/30 hover:bg-muted/60 active:scale-95 transition-all duration-150",
            )}
            title={s.label}
          >
            <Image
              src={s.imageUrl}
              alt={s.label}
              width={40}
              height={40}
              className="w-full h-full object-contain pointer-events-none"
            />
          </button>
        ))}
      </div>

      {/* Placed stickers list */}
      {placedStickers.length > 0 && (
        <div className="mt-1">
          <p className="text-xs text-muted-foreground mb-2">Added stickers</p>
          <div className="flex flex-wrap gap-2">
            {placedStickers.map((ps) => {
              const def = getStickerDef(ps.stickerId);
              return (
                <div
                  key={ps.uid}
                  className="flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1"
                >
                  {def && (
                    <Image
                      src={def.imageUrl}
                      alt={def.label}
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                    />
                  )}
                  <button
                    onClick={() => dispatch(removeSticker(ps.uid))}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
