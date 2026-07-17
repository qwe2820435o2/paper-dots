import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Arrangement } from "@/lib/polkaDotGrid";
import { POLKA_DOT_PRESETS, POLKA_DOT_PALETTES } from "@/lib/polkaDotPresets";
import { buildCharacterIconDataUrl, buildSampleShapeIconDataUrl, type SampleShapeId } from "@/lib/polkaDotSampleIcons";

export type PolkaDotShapeId = SampleShapeId | "character";

export interface PolkaDotState {
    arrangement: Arrangement;
    /** px, 2-100 */
    dotSize: number;
    /** px, 4-200 */
    spacing: number;
    dotColor: string;
    backgroundColor: string;
    /** 0-100 */
    opacity: number;
    /** degrees, -180 to 180 */
    rotation: number;
    /** degrees, -60 to 60 */
    skewX: number;
    /** degrees, -60 to 60 */
    skewY: number;
    /** 0.25 to 3 */
    zoom: number;
    presetId: string | null;
    paletteId: string | null;
    /** data URL of an uploaded custom icon; null means render plain dots */
    iconUrl: string | null;
    /** naturalWidth / naturalHeight of the uploaded icon, for aspect-correct sizing */
    iconAspect: number;
    /** text typed into the Character shape option */
    characterText: string;
    /** which built-in shape (or "character") is generating iconUrl, so it can be recolored when dotColor changes; null for plain dots, emoji, and custom uploads */
    shapeId: PolkaDotShapeId | null;
}

const initialState: PolkaDotState = {
    arrangement: "square",
    dotSize: 16,
    spacing: 40,
    dotColor: "#1a1a2e",
    backgroundColor: "#FFFFFF",
    opacity: 100,
    rotation: 0,
    skewX: 0,
    skewY: 0,
    zoom: 1,
    presetId: null,
    paletteId: null,
    iconUrl: null,
    iconAspect: 1,
    characterText: "A",
    shapeId: null,
};

/** Re-renders iconUrl at the current dotColor when the active shape is a built-in one; no-op for plain dots, emoji, and custom uploads. */
function recolorActiveShape(state: PolkaDotState) {
    if (state.shapeId === "character") {
        state.iconUrl = buildCharacterIconDataUrl(state.characterText, state.dotColor);
    } else if (state.shapeId) {
        state.iconUrl = buildSampleShapeIconDataUrl(state.shapeId, state.dotColor);
    }
}

const polkaDotSlice = createSlice({
    name: "polkaDot",
    initialState,
    reducers: {
        setDotSize(state, action: PayloadAction<number>) {
            state.dotSize = Math.max(2, Math.min(100, action.payload));
            state.presetId = null;
        },
        setSpacing(state, action: PayloadAction<number>) {
            state.spacing = Math.max(4, Math.min(200, action.payload));
            state.presetId = null;
        },
        setDotColor(state, action: PayloadAction<string>) {
            state.dotColor = action.payload;
            state.paletteId = null;
            recolorActiveShape(state);
        },
        setBackgroundColor(state, action: PayloadAction<string>) {
            state.backgroundColor = action.payload;
            state.paletteId = null;
        },
        setOpacity(state, action: PayloadAction<number>) {
            state.opacity = Math.max(0, Math.min(100, action.payload));
        },
        setRotation(state, action: PayloadAction<number>) {
            state.rotation = Math.max(-180, Math.min(180, action.payload));
            state.presetId = null;
        },
        setSkewX(state, action: PayloadAction<number>) {
            state.skewX = Math.max(-60, Math.min(60, action.payload));
            state.presetId = null;
        },
        setSkewY(state, action: PayloadAction<number>) {
            state.skewY = Math.max(-60, Math.min(60, action.payload));
            state.presetId = null;
        },
        setZoom(state, action: PayloadAction<number>) {
            state.zoom = Math.max(0.25, Math.min(3, action.payload));
            state.presetId = null;
        },
        applyPreset(state, action: PayloadAction<string>) {
            const preset = POLKA_DOT_PRESETS.find((p) => p.id === action.payload);
            if (!preset) return;
            state.arrangement = preset.arrangement;
            state.dotSize = preset.dotSize;
            state.spacing = preset.spacing;
            state.rotation = preset.rotation;
            state.skewX = preset.skewX;
            state.skewY = preset.skewY;
            state.zoom = preset.zoom;
            state.presetId = preset.id;
        },
        applyPalette(state, action: PayloadAction<string>) {
            const palette = POLKA_DOT_PALETTES.find((p) => p.id === action.payload);
            if (!palette) return;
            state.dotColor = palette.dotColor;
            state.backgroundColor = palette.backgroundColor;
            state.paletteId = palette.id;
            recolorActiveShape(state);
        },
        shuffleAppearance(state) {
            const preset = POLKA_DOT_PRESETS[Math.floor(Math.random() * POLKA_DOT_PRESETS.length)];
            const palette = POLKA_DOT_PALETTES[Math.floor(Math.random() * POLKA_DOT_PALETTES.length)];
            state.arrangement = preset.arrangement;
            state.dotSize = preset.dotSize;
            state.spacing = preset.spacing;
            state.rotation = preset.rotation;
            state.skewX = preset.skewX;
            state.skewY = preset.skewY;
            state.zoom = preset.zoom;
            state.presetId = preset.id;
            state.dotColor = palette.dotColor;
            state.backgroundColor = palette.backgroundColor;
            state.paletteId = palette.id;
            recolorActiveShape(state);
        },
        selectSampleShape(state, action: PayloadAction<SampleShapeId>) {
            state.shapeId = action.payload;
            state.iconUrl = buildSampleShapeIconDataUrl(action.payload, state.dotColor);
            state.iconAspect = 1;
        },
        selectCharacterShape(state) {
            state.shapeId = "character";
            state.iconUrl = buildCharacterIconDataUrl(state.characterText, state.dotColor);
            state.iconAspect = 1;
        },
        setIcon(state, action: PayloadAction<{ url: string; aspect: number }>) {
            state.iconUrl = action.payload.url;
            state.iconAspect = action.payload.aspect;
            state.shapeId = null;
        },
        clearIcon(state) {
            state.iconUrl = null;
            state.iconAspect = 1;
            state.shapeId = null;
        },
        setCharacterText(state, action: PayloadAction<string>) {
            state.characterText = action.payload;
            if (state.shapeId === "character") {
                state.iconUrl = buildCharacterIconDataUrl(action.payload, state.dotColor);
            }
        },
        resetTransform(state) {
            state.rotation = 0;
            state.skewX = 0;
            state.skewY = 0;
            state.zoom = 1;
            state.presetId = null;
        },
        resetPolkaDot() {
            return initialState;
        },
    },
});

export const {
    setDotSize,
    setSpacing,
    setDotColor,
    setBackgroundColor,
    setOpacity,
    setRotation,
    setSkewX,
    setSkewY,
    setZoom,
    applyPreset,
    applyPalette,
    shuffleAppearance,
    selectSampleShape,
    selectCharacterShape,
    setIcon,
    clearIcon,
    setCharacterText,
    resetTransform,
    resetPolkaDot,
} = polkaDotSlice.actions;

export default polkaDotSlice.reducer;
