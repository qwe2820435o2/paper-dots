"use client";

import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { addUploadedPhoto, replacePhoto } from "@/store/slices/boothSlice";
import { Check, ImagePlus } from "lucide-react";

export default function PhotoThumbnailPanel() {
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const capturedShots = useSelector(
    (state: RootState) => state.booth.capturedShots
  );
  const slotAssignments = useSelector(
    (state: RootState) => state.edit.slotAssignments
  );

  // Track which photos are already placed in slots
  const assignedIndices = new Set(slotAssignments.map((a) => a.photoIndex));

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        if (selectedIndex !== null) {
          dispatch(replacePhoto({ index: selectedIndex, dataUrl: reader.result }));
          setSelectedIndex(null);
        } else {
          dispatch(addUploadedPhoto(reader.result));
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="w-[176px] shrink-0 border-r border-border bg-card/40 flex flex-col">
      <div className="px-3 py-2 shrink-0 border-b border-border">
        <span className="text-xs font-serif font-medium text-muted-foreground uppercase tracking-[0.2em]">
          Photos · {capturedShots.length}
        </span>
      </div>
      {/* Photo list — max-height sized to 4 photos; scrolls when more */}
      <div className="overflow-y-auto max-h-[530px] p-3 flex flex-col gap-2.5">
        <p className="text-[10px] text-muted-foreground/60 text-center">
          Drag to a slot
        </p>
        {capturedShots.map((shot, i) => {
          const isAssigned = assignedIndices.has(i);
          return (
            <div
              key={i}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("photoIndex", i.toString());
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
              className={`relative w-full rounded-lg overflow-hidden shadow-sm cursor-grab active:cursor-grabbing transition-all ${
                selectedIndex === i
                  ? "ring-2 ring-primary opacity-100"
                  : isAssigned
                    ? "ring-1 ring-border opacity-50"
                    : "ring-1 ring-border opacity-100 hover:ring-primary"
              }`}
              style={{ aspectRatio: "4/3", flexShrink: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shot}
                alt={`Shot ${i + 1}`}
                className="w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute top-1.5 left-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-primary/80 text-primary-foreground text-[10px] font-bold">
                {i + 1}
              </div>
              {isAssigned && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                  <Check className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Upload button — outside scroll, always visible */}
      <div className="px-3 py-2 border-t border-border shrink-0">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/60 py-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
        >
          <ImagePlus className="w-3.5 h-3.5" />
          {selectedIndex !== null ? `Replace #${selectedIndex + 1}` : "Upload"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
