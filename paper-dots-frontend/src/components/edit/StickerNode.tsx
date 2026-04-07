"use client";

import { useRef, useEffect, useState } from "react";
import { Image as KonvaImage, Transformer, Group, Circle, Text } from "react-konva";
import Konva from "konva";

interface StickerNodeProps {
  uid: string;
  imageUrl: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onTransformEnd: (update: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }) => void;
  onDragEnd: (update: { x: number; y: number }) => void;
}

const DEFAULT_SIZE = 160; // px on canvas when scale = 1

export default function StickerNode({
  imageUrl,
  x,
  y,
  scale,
  rotation,
  isSelected,
  onSelect,
  onRemove,
  onTransformEnd,
  onDragEnd,
}: StickerNodeProps) {
  const imageNodeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [liveTransform, setLiveTransform] = useState<{
    x: number; y: number; scale: number; rotation: number;
  } | null>(null);

  // Load image from URL
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = imageUrl;
  }, [imageUrl]);

  // Bind Transformer when selected
  useEffect(() => {
    if (isSelected && trRef.current && imageNodeRef.current) {
      trRef.current.nodes([imageNodeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, image]);

  if (!image) return null;

  // Render at DEFAULT_SIZE; scale applied via scaleX/scaleY
  const displayW = DEFAULT_SIZE;
  const displayH = DEFAULT_SIZE * (image.height / image.width);

  // Delete button position — follows sticker center, scale, and rotation
  const curX = liveTransform ? liveTransform.x : x;
  const curY = liveTransform ? liveTransform.y : y;
  const curScale = liveTransform ? liveTransform.scale : scale;
  const curRotation = liveTransform ? liveTransform.rotation : rotation;
  const rad = (curRotation * Math.PI) / 180;
  const rawDx = (displayW * curScale) / 2 + 20;
  const rawDy = -(displayH * curScale) / 2 - 20;
  const deleteBtnX = curX + Math.cos(rad) * rawDx - Math.sin(rad) * rawDy;
  const deleteBtnY = curY + Math.sin(rad) * rawDx + Math.cos(rad) * rawDy;

  return (
    <>
      <KonvaImage
        ref={imageNodeRef}
        image={image}
        x={x}
        y={y}
        width={displayW}
        height={displayH}
        offsetX={displayW / 2}
        offsetY={displayH / 2}
        scaleX={scale}
        scaleY={scale}
        rotation={rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragMove={(e) => {
          const n = e.target;
          setLiveTransform({ x: n.x(), y: n.y(), scale: n.scaleX(), rotation: n.rotation() });
        }}
        onDragEnd={(e) => {
          setLiveTransform(null);
          onDragEnd({ x: e.target.x(), y: e.target.y() });
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
          onTransformEnd({
            x: node.x(),
            y: node.y(),
            scale: node.scaleX(),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
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
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      )}

      {/* Delete button — follows sticker with rotation */}
      {isSelected && (
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
  );
}
