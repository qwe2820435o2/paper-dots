"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Stage, Layer, Rect, Text, Image as KonvaImage } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import Konva from "konva";
import { RootState } from "@/store";
import { getTemplate, hasStaticPlaceholders } from "@/lib/templates";
import { useDetectSlots } from "@/lib/useDetectSlots";
import { getStickerDef } from "@/lib/stickers";
import {
  assignPhotoToSlot,
  addSticker,
  removePhotoFromSlot,
  removeSticker,
  updatePhotoTransform,
  updateStickerTransform,
  setActiveSlot,
  setActiveStickerUid,
  clearSelection,
} from "@/store/slices/editSlice";
import type { PlacedSticker } from "@/lib/stickers";
import PhotoSlotGroup from "./PhotoSlotGroup";
import StickerNode from "./StickerNode";

export interface EditCanvasHandle {
  getDataUrl(): string;
}

function formatTimestamp(d: Date): string {
  const dd = d.getDate().toString().padStart(2, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = d.getFullYear();
  const HH = d.getHours().toString().padStart(2, '0');
  const MM = d.getMinutes().toString().padStart(2, '0');
  const SS = d.getSeconds().toString().padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${HH}:${MM}:${SS}`;
}

const EditCanvas = forwardRef<EditCanvasHandle>(function EditCanvas(
  _props,
  ref
) {
  const dispatch = useDispatch();
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 });
  const [capturedAt] = useState(() => formatTimestamp(new Date()));
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null);

  const capturedShots = useSelector(
    (state: RootState) => state.booth.capturedShots
  );
  const selectedTemplateId = useSelector(
    (state: RootState) => state.edit.selectedTemplateId
  );
  const slotAssignments = useSelector(
    (state: RootState) => state.edit.slotAssignments
  );
  const placedStickers = useSelector(
    (state: RootState) => state.edit.placedStickers
  );
  const activeSlotId = useSelector(
    (state: RootState) => state.edit.activeSlotId
  );
  const activeStickerUid = useSelector(
    (state: RootState) => state.edit.activeStickerUid
  );

  const template = useMemo(
    () => getTemplate(selectedTemplateId),
    [selectedTemplateId]
  );

  const detectionState = useDetectSlots(template);

  const placeholders = useMemo(() => {
    if (hasStaticPlaceholders(template)) return template.placeholders;
    if (detectionState.status === "ready") return detectionState.placeholders;
    return [];
  }, [template, detectionState]);

  useEffect(() => {
    if (!template.backgroundImage) {
      setBgImage(null);
      setOverlayImage(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      setBgImage(img);
      setOverlayImage(img);
    };
    img.src = template.backgroundImage;
  }, [template.backgroundImage]);

  // Auto-assign photos to slots once placeholders are detected
  useEffect(() => {
    if (placeholders.length === 0 || capturedShots.length === 0) return;
    if (slotAssignments.length > 0) return;

    const count = Math.min(capturedShots.length, placeholders.length);
    Array.from({ length: count }, (_, i) => {
      const img = new window.Image();
      img.onload = () => {
        const slot = placeholders[i];
        const scale = Math.max(slot.width / img.width, slot.height / img.height);
        dispatch(assignPhotoToSlot({ slotId: slot.id, photoIndex: i, initialScale: scale }));
      };
      img.src = capturedShots[i];
    });
  }, [placeholders, capturedShots, slotAssignments.length, dispatch]);

  // Padding around Stage so Transformer handles are not clipped by canvas boundary
  const HANDLE_PAD = 60;

  // Compute display scale: <=4 slots fit entirely; >4 slots show ~3 slots per screen
  const displayScale = useMemo(() => {
    const scaleX = (containerSize.w - HANDLE_PAD * 2) / template.canvasWidth;
    if (template.slotCount <= 4) {
      const scaleY = (containerSize.h - HANDLE_PAD * 2) / template.canvasHeight;
      return Math.min(scaleX, scaleY, 1);
    }
    // Scale so ~3 slots fit in the viewport height
    const slotH = placeholders[0]?.height ?? template.canvasHeight / template.slotCount;
    const threeSlotCanvasH = slotH * 3;
    const scaleY = (containerSize.h - HANDLE_PAD * 2) / threeSlotCanvasH;
    return Math.min(scaleX, scaleY, 1);
  }, [containerSize, template, placeholders]);

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Export
  useImperativeHandle(ref, () => ({
    getDataUrl() {
      const stage = stageRef.current;
      if (!stage) return "";
      const oldScaleX = stage.scaleX();
      const oldScaleY = stage.scaleY();
      const layerOffset = HANDLE_PAD / displayScale;
      stage.scale({ x: 1, y: 1 });
      stage.size({
        width: template.canvasWidth + layerOffset * 2,
        height: template.canvasHeight + layerOffset * 2,
      });
      const url = stage.toDataURL({
        x: layerOffset,
        y: layerOffset,
        width: template.canvasWidth,
        height: template.canvasHeight,
        pixelRatio: 3,
      });
      stage.scale({ x: oldScaleX, y: oldScaleY });
      stage.size({
        width: template.canvasWidth * displayScale + HANDLE_PAD * 2,
        height: template.canvasHeight * displayScale + HANDLE_PAD * 2,
      });
      return url;
    },
  }));

  // HTML5 drop handler — supports both photo and sticker drops
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const stageRect = stage.container().getBoundingClientRect();
      const canvasX = (e.clientX - stageRect.left - HANDLE_PAD) / displayScale;
      const canvasY = (e.clientY - stageRect.top - HANDLE_PAD) / displayScale;

      // 1. Try sticker drop
      const stickerId = e.dataTransfer.getData("stickerId");
      if (stickerId) {
        const def = getStickerDef(stickerId);
        if (!def) return;
        const placed: PlacedSticker = {
          uid: Math.random().toString(36).slice(2) + Date.now().toString(36),
          stickerId,
          x: canvasX,
          y: canvasY,
          scale: 1.0,
          rotation: 0,
        };
        dispatch(addSticker(placed));
        dispatch(setActiveStickerUid(placed.uid));
        return;
      }

      // 2. Try photo drop
      const photoIndex = parseInt(e.dataTransfer.getData("photoIndex"), 10);
      if (isNaN(photoIndex)) return;

      for (const ph of placeholders) {
        if (
          canvasX >= ph.x &&
          canvasX <= ph.x + ph.width &&
          canvasY >= ph.y &&
          canvasY <= ph.y + ph.height
        ) {
          const imgW = 1280;
          const imgH = 960;
          const scaleX = ph.width / imgW;
          const scaleY = ph.height / imgH;
          const coverScale = Math.max(scaleX, scaleY);

          dispatch(
            assignPhotoToSlot({
              slotId: ph.id,
              photoIndex,
              initialScale: coverScale,
            })
          );
          dispatch(setActiveSlot(ph.id));
          return;
        }
      }
    },
    [dispatch, displayScale, placeholders]
  );

  // Scroll to zoom photo in active slot
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      if (!activeSlotId) return;

      const assignment = slotAssignments.find(
        (a) => a.slotId === activeSlotId
      );
      if (!assignment) return;

      const scaleDelta = e.evt.deltaY > 0 ? 0.95 : 1.05;
      const newScale = Math.max(
        0.1,
        Math.min(5, assignment.scale * scaleDelta)
      );

      dispatch(
        updatePhotoTransform({ slotId: activeSlotId, scale: newScale })
      );
    },
    [activeSlotId, slotAssignments, dispatch]
  );

  // Click on empty stage area to deselect
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (e.target === e.target.getStage()) {
        dispatch(clearSelection());
      }
    },
    [dispatch]
  );

  const stageW = template.canvasWidth * displayScale + HANDLE_PAD * 2;
  const stageH = template.canvasHeight * displayScale + HANDLE_PAD * 2;
  const layerPad = HANDLE_PAD / displayScale;
  const scrollable = template.slotCount > 4;

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${scrollable ? "overflow-y-auto" : "overflow-hidden"}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className={`flex justify-center ${scrollable ? "py-6" : ""}`}>
      <div className="relative" style={{ width: stageW, height: stageH }}>
        {/* Shadow decoration scoped to canvas content area only */}
        <div
          style={{
            position: "absolute",
            left: HANDLE_PAD,
            top: HANDLE_PAD,
            width: stageW - HANDLE_PAD * 2,
            height: stageH - HANDLE_PAD * 2,
            borderRadius: 8,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            pointerEvents: "none",
          }}
        />
        <Stage
          ref={stageRef}
          width={stageW}
          height={stageH}
          scaleX={displayScale}
          scaleY={displayScale}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onWheel={handleWheel}
        >
        <Layer x={layerPad} y={layerPad}>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={template.canvasWidth}
            height={template.canvasHeight}
            fill={template.backgroundColor}
          />

          {/* Photo slots — content layer (below template overlay) */}
          {placeholders.map((ph) => {
            const assignment = slotAssignments.find(
              (a) => a.slotId === ph.id
            );
            const photoUrl = assignment
              ? capturedShots[assignment.photoIndex]
              : undefined;

            return (
              <PhotoSlotGroup
                key={ph.id}
                placeholder={ph}
                assignment={assignment}
                photoDataUrl={photoUrl}
                isActive={activeSlotId === ph.id}
                templateBg={template.backgroundColor}
                layer="content"
                onSelect={() => dispatch(setActiveSlot(ph.id))}
                onRemove={() => dispatch(removePhotoFromSlot(ph.id))}
                onPhotoTransform={(update) =>
                  dispatch(
                    updatePhotoTransform({ slotId: ph.id, ...update })
                  )
                }
              />
            );
          })}

          {/* Template overlay — white areas are transparent, decorations are opaque */}
          {overlayImage && (
            <KonvaImage
              x={0}
              y={0}
              width={template.canvasWidth}
              height={template.canvasHeight}
              image={overlayImage}
              listening={false}
            />
          )}

          {/* Photo slots — controls layer (above template overlay) */}
          {placeholders.map((ph) => {
            const assignment = slotAssignments.find(
              (a) => a.slotId === ph.id
            );
            const photoUrl = assignment
              ? capturedShots[assignment.photoIndex]
              : undefined;

            return (
              <PhotoSlotGroup
                key={`ctrl-${ph.id}`}
                placeholder={ph}
                assignment={assignment}
                photoDataUrl={photoUrl}
                isActive={activeSlotId === ph.id}
                templateBg={template.backgroundColor}
                layer="controls"
                onSelect={() => dispatch(setActiveSlot(ph.id))}
                onRemove={() => dispatch(removePhotoFromSlot(ph.id))}
                onPhotoTransform={(update) =>
                  dispatch(
                    updatePhotoTransform({ slotId: ph.id, ...update })
                  )
                }
              />
            );
          })}

          {/* Paper Dots branding + timestamp */}
          {!template.hideBranding && <>
            <Text
              x={0}
              y={1661.7}
              width={template.canvasWidth}
              text="PAPER DOTS"
              fontSize={18}
              fontFamily="Geist Mono"
              fontStyle="bold"
              fill={template.accentColor}
              align="center"
            />
            <Text
              x={0}
              y={1704.4}
              width={template.canvasWidth}
              text={capturedAt}
              fontSize={18}
              fontFamily="sans-serif"
              fill={template.accentColor}
              align="center"
            />
          </>}

          {/* Stickers */}
          {placedStickers.map((ps) => {
            const def = getStickerDef(ps.stickerId);
            if (!def) return null;
            return (
              <StickerNode
                key={ps.uid}
                uid={ps.uid}
                imageUrl={def.imageUrl}
                x={ps.x}
                y={ps.y}
                scale={ps.scale}
                rotation={ps.rotation}
                isSelected={activeStickerUid === ps.uid}
                onSelect={() => dispatch(setActiveStickerUid(ps.uid))}
                onRemove={() => dispatch(removeSticker(ps.uid))}
                onTransformEnd={(update) =>
                  dispatch(
                    updateStickerTransform({ uid: ps.uid, ...update })
                  )
                }
                onDragEnd={(update) =>
                  dispatch(
                    updateStickerTransform({ uid: ps.uid, ...update })
                  )
                }
              />
            );
          })}
        </Layer>
        </Stage>
      </div>
      </div>
    </div>
  );
});

export default EditCanvas;
