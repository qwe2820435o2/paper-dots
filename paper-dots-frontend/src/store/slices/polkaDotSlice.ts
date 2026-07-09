import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Arrangement } from "@/lib/polkaDotGrid";

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
}

const initialState: PolkaDotState = {
    arrangement: "square",
    dotSize: 16,
    spacing: 40,
    dotColor: "#1a1a2e",
    backgroundColor: "#F8FCF2",
    opacity: 100,
    rotation: 0,
    skewX: 0,
    skewY: 0,
    zoom: 1,
    presetId: null,
    paletteId: null,
};

const polkaDotSlice = createSlice({
    name: "polkaDot",
    initialState,
    reducers: {
        setArrangement(state, action: PayloadAction<Arrangement>) {
            state.arrangement = action.payload;
        },
        setDotSize(state, action: PayloadAction<number>) {
            state.dotSize = Math.max(2, Math.min(100, action.payload));
        },
        setSpacing(state, action: PayloadAction<number>) {
            state.spacing = Math.max(4, Math.min(200, action.payload));
        },
        setDotColor(state, action: PayloadAction<string>) {
            state.dotColor = action.payload;
        },
        setBackgroundColor(state, action: PayloadAction<string>) {
            state.backgroundColor = action.payload;
        },
        setOpacity(state, action: PayloadAction<number>) {
            state.opacity = Math.max(0, Math.min(100, action.payload));
        },
        setRotation(state, action: PayloadAction<number>) {
            state.rotation = Math.max(-180, Math.min(180, action.payload));
        },
        setSkewX(state, action: PayloadAction<number>) {
            state.skewX = Math.max(-60, Math.min(60, action.payload));
        },
        setSkewY(state, action: PayloadAction<number>) {
            state.skewY = Math.max(-60, Math.min(60, action.payload));
        },
        setZoom(state, action: PayloadAction<number>) {
            state.zoom = Math.max(0.25, Math.min(3, action.payload));
        },
        resetPolkaDot() {
            return initialState;
        },
    },
});

export const {
    setArrangement,
    setDotSize,
    setSpacing,
    setDotColor,
    setBackgroundColor,
    setOpacity,
    setRotation,
    setSkewX,
    setSkewY,
    setZoom,
    resetPolkaDot,
} = polkaDotSlice.actions;

export default polkaDotSlice.reducer;
