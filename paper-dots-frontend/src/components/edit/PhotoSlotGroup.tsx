"use client";

import { useEffect, useRef, useState } from "react";
import { Group, Rect, Text, Circle, Image as KonvaImage, Transformer } from "react-konva";
import type { PlaceholderDef } from "@/lib/templates";
import type { PhotoInSlot } from "@/store/slices/editSlice";
import Konva from "konva";

interface PhotoSlotGroupProps {
  placeholder: PlaceholderDef;
  assignment: PhotoInSlot | undefined;
  photoDataUrl: string | undefined;
  isActive: boolean;
  templateBg: string;
  layer?: 'content' | 'controls';
  onSelect: () => void;
  onRemove: () => void;
  onPhotoTransform: (update: {
    offsetX?: number;
    offsetY?: number;
    scale?: number;
    rotation?: number;
  }) => void;
}

function bgLuminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

const CLIP_MARGIN = 8;

export default function PhotoSlotGroup({
  placeholder,
  assignment,
  photoDataUrl,
  isActive,
  templateBg,
  layer,
  onSelect,
  onRemove,
  onPhotoTransform,
}: PhotoSlotGroupProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [liveTransform, setLiveTransform] = useState<{
    x: number; y: number; scale: number; rotation: number;
  } | null>(null);
  const imageNodeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // Load image from data URL and extract average color
  useEffect(() => {
    if (!photoDataUrl) {
      setImage(null);
      setDominantColor(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      // Downsample to 16x16 to get average color cheaply
      const c = document.createElement('canvas');
      const s = 16;
      c.width = s;
      c.height = s;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0, s, s);
      const d = ctx.getImageData(0, 0, s, s).data;
      let rSum = 0, gSum = 0, bSum = 0;
      const total = s * s;
      for (let i = 0; i < d.length; i += 4) {
        rSum += d[i];
        gSum += d[i + 1];
        bSum += d[i + 2];
      }
      const r = Math.round(rSum / total);
      const g = Math.round(gSum / total);
      const b = Math.round(bSum / total);
      setDominantColor(`rgb(${r},${g},${b})`);
    };
    img.src = photoDataUrl;
  }, [photoDataUrl]);

  // Bind Transformer to image node when active
  useEffect(() => {
    if (isActive && trRef.current && imageNodeRef.current) {
      trRef.current.nodes([imageNodeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isActive, image]);

  const inactiveStroke = bgLuminance(templateBg) > 0.5 ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)';

  const { x, y, width, height, borderRadius = 0, rotation: slotRotation = 0, label } = placeholder;

  // Clip function for this slot — expanded by CLIP_MARGIN so the photo
  // fully covers the transparent cutout in the overlay template
  const clipFunc = (ctx: Konva.Context) => {
    if (borderRadius > 0) {
      ctx.beginPath();
      (ctx as unknown as CanvasRenderingContext2D).roundRect(
        -CLIP_MARGIN, -CLIP_MARGIN,
        width + CLIP_MARGIN * 2, height + CLIP_MARGIN * 2,
        borderRadius
      );
      ctx.closePath();
    } else {
      ctx.rect(-CLIP_MARGIN, -CLIP_MARGIN, width + CLIP_MARGIN * 2, height + CLIP_MARGIN * 2);
    }
  };

  const showContent = !layer || layer === 'content';
  const showControls = !layer || layer === 'controls';

  // Photo position within the clipped group
  const photoX = assignment ? width / 2 + assignment.offsetX : 0;
  const photoY = assignment ? height / 2 + assignment.offsetY : 0;
  const photoScale = assignment?.scale ?? 1;

  // Delete button position — follows photo center, scale, and rotation
  const curX = liveTransform ? liveTransform.x : photoX;
  const curY = liveTransform ? liveTransform.y : photoY;
  const curScale = liveTransform ? liveTransform.scale : photoScale;
  const curRotation = liveTransform ? liveTransform.rotation : (assignment?.rotation ?? 0);
  const rad = (curRotation * Math.PI) / 180;
  const rawDx = (image ? image.width * curScale : 0) / 2 + 20;
  const rawDy = -(image ? image.height * curScale : 0) / 2 - 20;
  const deleteBtnX = x + curX + Math.cos(rad) * rawDx - Math.sin(rad) * rawDy;
  const deleteBtnY = y + curY + Math.sin(rad) * rawDx + Math.cos(rad) * rawDy;

  return (
    <>
      {/* Content layer: clipped photo content (rendered below template overlay) */}
      {showContent && (
        <Group
          x={slotRotation ? x + width / 2 : x}
          y={slotRotation ? y + height / 2 : y}
          rotation={slotRotation}
          offsetX={slotRotation ? width / 2 : 0}
          offsetY={slotRotation ? height / 2 : 0}
          clipFunc={clipFunc}
          clipWidth={width + CLIP_MARGIN * 2}
          clipHeight={height + CLIP_MARGIN * 2}
          onClick={onSelect}
          onTap={onSelect}
        >
          {/* Slot background — uses photo's average color to hide edge gaps */}
          <Rect
            x={-CLIP_MARGIN}
            y={-CLIP_MARGIN}
            width={width + CLIP_MARGIN * 2}
            height={height + CLIP_MARGIN * 2}
            fill={templateBg ?? "#2a2a2a"}
            stroke={isActive ? "#3b82f6" : "transparent"}
            strokeWidth={isActive ? 4 : 0}
          />

          {/* Empty slot label */}
          {!assignment && label && (
            <Text
              x={0}
              y={0}
              width={width}
              height={height}
              text={label}
              fontSize={Math.min(width, height) * 0.3}
              fontFamily="sans-serif"
              fontStyle="bold"
              fill="#555555"
              align="center"
              verticalAlign="middle"
            />
          )}

          {/* Photo image */}
          {assignment && image && (
            <KonvaImage
              ref={imageNodeRef}
              image={image}
              x={photoX}
              y={photoY}
              offsetX={image.width / 2}
              offsetY={image.height / 2}
              scaleX={photoScale}
              scaleY={photoScale}
              rotation={assignment.rotation}
              draggable={isActive}
              onDragMove={(e) => {
                const n = e.target;
                setLiveTransform({ x: n.x(), y: n.y(), scale: n.scaleX(), rotation: n.rotation() });
              }}
              onDragEnd={(e) => {
                setLiveTransform(null);
                const node = e.target;
                onPhotoTransform({
                  offsetX: node.x() - width / 2,
                  offsetY: node.y() - height / 2,
                });
              }}
              onTransform={() => {
                const node = imageNodeRef.current;
                if (!node) return;
                setLiveTransform({ x: node.x(), y: node.y(), scale: node.scaleX(), rotation: node.rotation() });
              }}
              onTransformEnd={() => {
                setLiveTransform(null);
                const node = imageNodeRef.current;
                if (!node) return;
                onPhotoTransform({
                  offsetX: node.x() - width / 2,
                  offsetY: node.y() - height / 2,
                  scale: node.scaleX(),
                  rotation: node.rotation(),
                });
              }}
            />
          )}

        </Group>
      )}

      {/* Controls layer: Transformer + delete button (rendered above template overlay) */}
      {showControls && (
        <>
          {/* Transformer — outside clip so rotation handle is not clipped */}
          {isActive && assignment && image && (
            <Transformer
              ref={trRef}
              rotateEnabled
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
              ]}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 30 || newBox.height < 30) return oldBox;
                return newBox;
              }}
            />
          )}

          {/* Delete button — follows photo position, visible when slot is active and photo is loaded */}
          {isActive && assignment && image && (
            <Group
              x={deleteBtnX}
              y={deleteBtnY}
              onClick={(e) => { e.cancelBubble = true; onRemove(); }}
              onTap={(e) => { e.cancelBubble = true; onRemove(); }}
            >
              <Circle
                radius={22}
                fill="#ef4444"
                shadowBlur={6}
                shadowColor="rgba(0,0,0,0.35)"
              />
              <Text
                text="✕"
                x={-22}
                y={-13}
                width={44}
                fontSize={20}
                fontStyle="bold"
                fill="white"
                align="center"
              />
            </Group>
          )}
        </>
      )}
    </>
  );
}
