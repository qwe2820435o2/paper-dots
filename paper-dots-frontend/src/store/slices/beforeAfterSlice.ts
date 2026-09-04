import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** `slider` has a draggable divider; the other two are static two-panel arrangements. */
export type BeforeAfterLayout = "slider" | "side-by-side" | "stack";

export type LabelPosition = "top-left" | "bottom-left" | "bottom-center" | "top-center" | "top-right" | "bottom-right";

export type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** "custom" reads `width`/`height` directly; the other three are fixed ratios. */
export type AspectPreset = "4/5" | "9/16" | "16/9" | "custom";

export type BeforeAfterSlot = "before" | "after";

/** Manual crop applied to a photo, relative to its own cover-fit cell — shifts/scales/rotates
 *  the already cover-fit image so a photo taken from a slightly different angle/distance can be
 *  framed, or two photos with different aspect ratios can be lined up with each other. */
export interface ImageTransformState {
    /** -50 to 50, percent of the cell's width/height */
    offsetXPct: number;
    offsetYPct: number;
    /** 0.5 - 2 */
    scale: number;
    /** -45 to 45 */
    rotationDeg: number;
}

export interface TextLabelState {
    /** Empty string means "use the translated default" — Canvas falls back to t("before")/
     *  t("after") so the caption stays localized until the user types something of their own. */
    text: string;
    position: LabelPosition;
}

/** Styling shared by both the before and after labels — the prototype this editor is modeled on
 *  keeps one shared style rather than doubling every font/color control. */
export interface LabelStyleState {
    visible: boolean;
    fontFamily: string;
    fontSize: number;
    color: string;
    backgroundColor: string;
    /** 0 - 100 */
    backgroundOpacity: number;
}

export interface LogoState {
    /** object URL of the uploaded logo, or null */
    url: string | null;
    /** 5 - 40, percent of canvas width */
    sizePct: number;
    position: LogoPosition;
}

export interface BeforeAfterState {
    /** object URL of the uploaded "before" photo, or null */
    beforeUrl: string | null;
    /** object URL of the uploaded "after" photo, or null */
    afterUrl: string | null;
    /** 0 - 100, position of the comparison divider (only used by the "slider" layout) */
    sliderPosition: number;
    layoutType: BeforeAfterLayout;
    /** 0 - 48px, gap between panels for "side-by-side" and "stack" */
    gap: number;
    /** Fill color shown in the gap between panels */
    canvasBackground: string;
    /** Frame aspect ratio — independent of either photo's own dimensions; both photos cover-fit
     *  into whatever frame this describes. */
    aspect: { preset: AspectPreset; width: number; height: number };
    beforeTransform: ImageTransformState;
    afterTransform: ImageTransformState;
    beforeLabel: TextLabelState;
    afterLabel: TextLabelState;
    labelStyle: LabelStyleState;
    logo: LogoState;
}

const initialTransform: ImageTransformState = {
    offsetXPct: 0,
    offsetYPct: 0,
    scale: 1,
    rotationDeg: 0,
};

/** True once a photo has actually been nudged off its default cover-fit placement. Lets callers
 *  tell a reset that throws away real work from one that changes nothing. */
export function hasTransform(t: ImageTransformState): boolean {
    return t.offsetXPct !== 0 || t.offsetYPct !== 0 || t.scale !== 1 || t.rotationDeg !== 0;
}

/** Real pixel dimensions behind each preset — not just the ratio — so `aspect.width`/`height`
 *  stay meaningful numbers (e.g. for the "custom size" fields to show something sensible if the
 *  user opens them right after picking a preset), not the bare "4"/"5" a naive ratio split would
 *  produce. Canvas.tsx only ever divides them for the ratio, but the resolution still matters:
 *  it's what a "custom" edit starting from a preset perturbs. */
const ASPECT_PRESET_SIZES: Record<Exclude<AspectPreset, "custom">, { width: number; height: number }> = {
    "4/5": { width: 1080, height: 1350 },
    "9/16": { width: 1080, height: 1920 },
    "16/9": { width: 1920, height: 1080 },
};

const initialState: BeforeAfterState = {
    beforeUrl: null,
    afterUrl: null,
    sliderPosition: 50,
    layoutType: "slider",
    gap: 12,
    canvasBackground: "#ffffff",
    aspect: { preset: "4/5", width: 1080, height: 1350 },
    beforeTransform: initialTransform,
    afterTransform: initialTransform,
    beforeLabel: { text: "", position: "top-left" },
    afterLabel: { text: "", position: "top-left" },
    labelStyle: {
        visible: true,
        fontFamily: "Arial",
        fontSize: 15,
        color: "#ffffff",
        backgroundColor: "#20232d",
        backgroundOpacity: 65,
    },
    logo: { url: null, sizePct: 14, position: "bottom-right" },
};

function transformKey(slot: BeforeAfterSlot): "beforeTransform" | "afterTransform" {
    return slot === "before" ? "beforeTransform" : "afterTransform";
}

function labelKey(slot: BeforeAfterSlot): "beforeLabel" | "afterLabel" {
    return slot === "before" ? "beforeLabel" : "afterLabel";
}

const beforeAfterSlice = createSlice({
    name: "beforeAfter",
    initialState,
    reducers: {
        setBeforeUrl(state, action: PayloadAction<string | null>) {
            state.beforeUrl = action.payload;
        },
        setAfterUrl(state, action: PayloadAction<string | null>) {
            state.afterUrl = action.payload;
        },
        setSliderPosition(state, action: PayloadAction<number>) {
            state.sliderPosition = Math.max(0, Math.min(100, action.payload));
        },
        setLayoutType(state, action: PayloadAction<BeforeAfterLayout>) {
            state.layoutType = action.payload;
        },
        setGap(state, action: PayloadAction<number>) {
            state.gap = Math.max(0, Math.min(48, action.payload));
        },
        setCanvasBackground(state, action: PayloadAction<string>) {
            state.canvasBackground = action.payload;
        },
        setAspectPreset(state, action: PayloadAction<Exclude<AspectPreset, "custom">>) {
            const { width, height } = ASPECT_PRESET_SIZES[action.payload];
            state.aspect = { preset: action.payload, width, height };
        },
        setCustomAspect(state, action: PayloadAction<{ width: number; height: number }>) {
            state.aspect = { preset: "custom", width: action.payload.width, height: action.payload.height };
        },
        setTransformOffset(state, action: PayloadAction<{ slot: BeforeAfterSlot; xPct: number; yPct: number }>) {
            const t = state[transformKey(action.payload.slot)];
            t.offsetXPct = Math.max(-50, Math.min(50, action.payload.xPct));
            t.offsetYPct = Math.max(-50, Math.min(50, action.payload.yPct));
        },
        setTransformScale(state, action: PayloadAction<{ slot: BeforeAfterSlot; scale: number }>) {
            state[transformKey(action.payload.slot)].scale = Math.max(0.5, Math.min(2, action.payload.scale));
        },
        setTransformRotation(state, action: PayloadAction<{ slot: BeforeAfterSlot; rotationDeg: number }>) {
            state[transformKey(action.payload.slot)].rotationDeg = Math.max(-45, Math.min(45, action.payload.rotationDeg));
        },
        resetTransform(state, action: PayloadAction<BeforeAfterSlot>) {
            state[transformKey(action.payload)] = initialTransform;
        },
        setLabelText(state, action: PayloadAction<{ slot: BeforeAfterSlot; text: string }>) {
            state[labelKey(action.payload.slot)].text = action.payload.text;
        },
        setLabelPosition(state, action: PayloadAction<{ slot: BeforeAfterSlot; position: LabelPosition }>) {
            state[labelKey(action.payload.slot)].position = action.payload.position;
        },
        setLabelVisible(state, action: PayloadAction<boolean>) {
            state.labelStyle.visible = action.payload;
        },
        setLabelFontFamily(state, action: PayloadAction<string>) {
            state.labelStyle.fontFamily = action.payload;
        },
        setLabelFontSize(state, action: PayloadAction<number>) {
            state.labelStyle.fontSize = Math.max(12, Math.min(96, action.payload));
        },
        setLabelColor(state, action: PayloadAction<string>) {
            state.labelStyle.color = action.payload;
        },
        setLabelBackgroundColor(state, action: PayloadAction<string>) {
            state.labelStyle.backgroundColor = action.payload;
        },
        setLabelBackgroundOpacity(state, action: PayloadAction<number>) {
            state.labelStyle.backgroundOpacity = Math.max(0, Math.min(100, action.payload));
        },
        setLogoUrl(state, action: PayloadAction<string | null>) {
            state.logo.url = action.payload;
        },
        setLogoSize(state, action: PayloadAction<number>) {
            state.logo.sizePct = Math.max(5, Math.min(40, action.payload));
        },
        setLogoPosition(state, action: PayloadAction<LogoPosition>) {
            state.logo.position = action.payload;
        },
        resetBeforeAfter() {
            return initialState;
        },
    },
});

export const {
    setBeforeUrl,
    setAfterUrl,
    setSliderPosition,
    setLayoutType,
    setGap,
    setCanvasBackground,
    setAspectPreset,
    setCustomAspect,
    setTransformOffset,
    setTransformScale,
    setTransformRotation,
    resetTransform,
    setLabelText,
    setLabelPosition,
    setLabelVisible,
    setLabelFontFamily,
    setLabelFontSize,
    setLabelColor,
    setLabelBackgroundColor,
    setLabelBackgroundOpacity,
    setLogoUrl,
    setLogoSize,
    setLogoPosition,
    resetBeforeAfter,
} = beforeAfterSlice.actions;

export default beforeAfterSlice.reducer;
