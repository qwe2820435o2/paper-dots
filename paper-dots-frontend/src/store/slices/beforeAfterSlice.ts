import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** `slider` has a draggable divider; the other three are static two-panel arrangements. */
export type BeforeAfterLayout = "slider" | "side-by-side" | "split" | "stack";

export interface TextLabelState {
    /** Empty string means "no label" — Canvas skips rendering the layer entirely. */
    text: string;
    color: string;
    fontSize: number;
    /** 0 - 100, position as a percent of canvas width/height so the label stays put across
     *  layout switches and container resizes, which each use a differently-sized canvas. */
    xPct: number;
    yPct: number;
}

/** Manual alignment nudge applied to the "after" photo, relative to its own cover-fit cell.
 *  Kept separate from cropping — this shifts/scales/rotates the already cover-fit image so
 *  a photo taken from a slightly different angle/distance can be lined up with "before". */
export interface AfterTransformState {
    /** -50 to 50, percent of the cell's width/height */
    offsetXPct: number;
    offsetYPct: number;
    /** 0.5 - 2 */
    scale: number;
    /** -45 to 45 */
    rotationDeg: number;
}

export interface BeforeAfterState {
    /** object URL of the uploaded "before" photo, or null */
    beforeUrl: string | null;
    /** object URL of the uploaded "after" photo, or null */
    afterUrl: string | null;
    /** 0 - 100, position of the comparison divider (only used by the "slider" layout) */
    sliderPosition: number;
    layoutType: BeforeAfterLayout;
    label: TextLabelState;
    /** True while the user is nudging "after" into alignment — Canvas swaps to a dedicated
     *  before/after overlay view regardless of `layoutType` while this is on. */
    alignMode: boolean;
    afterTransform: AfterTransformState;
}

const initialAfterTransform: AfterTransformState = {
    offsetXPct: 0,
    offsetYPct: 0,
    scale: 1,
    rotationDeg: 0,
};

/** True once the user has actually nudged "after" off its default cover-fit placement. Lets
 *  callers tell a reset that throws away real work from one that changes nothing. */
export function hasAfterTransform(t: AfterTransformState): boolean {
    return t.offsetXPct !== 0 || t.offsetYPct !== 0 || t.scale !== 1 || t.rotationDeg !== 0;
}

const initialState: BeforeAfterState = {
    beforeUrl: null,
    afterUrl: null,
    sliderPosition: 50,
    layoutType: "slider",
    label: {
        text: "",
        color: "#ffffff",
        fontSize: 32,
        xPct: 50,
        yPct: 88,
    },
    alignMode: false,
    afterTransform: initialAfterTransform,
};

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
        setLabelText(state, action: PayloadAction<string>) {
            state.label.text = action.payload;
        },
        setLabelColor(state, action: PayloadAction<string>) {
            state.label.color = action.payload;
        },
        setLabelFontSize(state, action: PayloadAction<number>) {
            state.label.fontSize = Math.max(12, Math.min(96, action.payload));
        },
        setLabelPosition(state, action: PayloadAction<{ xPct: number; yPct: number }>) {
            state.label.xPct = Math.max(0, Math.min(100, action.payload.xPct));
            state.label.yPct = Math.max(0, Math.min(100, action.payload.yPct));
        },
        setAlignMode(state, action: PayloadAction<boolean>) {
            state.alignMode = action.payload;
        },
        setAfterOffset(state, action: PayloadAction<{ xPct: number; yPct: number }>) {
            state.afterTransform.offsetXPct = Math.max(-50, Math.min(50, action.payload.xPct));
            state.afterTransform.offsetYPct = Math.max(-50, Math.min(50, action.payload.yPct));
        },
        setAfterScale(state, action: PayloadAction<number>) {
            state.afterTransform.scale = Math.max(0.5, Math.min(2, action.payload));
        },
        setAfterRotation(state, action: PayloadAction<number>) {
            state.afterTransform.rotationDeg = Math.max(-45, Math.min(45, action.payload));
        },
        resetAfterTransform(state) {
            state.afterTransform = initialAfterTransform;
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
    setLabelText,
    setLabelColor,
    setLabelFontSize,
    setLabelPosition,
    setAlignMode,
    setAfterOffset,
    setAfterScale,
    setAfterRotation,
    resetAfterTransform,
    resetBeforeAfter,
} = beforeAfterSlice.actions;

export default beforeAfterSlice.reducer;
