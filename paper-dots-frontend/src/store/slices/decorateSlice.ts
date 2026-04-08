import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type DotShape =
    | "circle"
    | "square"
    | "teardrop"
    | "heart"
    | "star"
    | "hexagon"
    | "leaf"
    | "crescent";

export interface DotConfig {
    shape: DotShape;
    /** 0.1 - 1.0 */
    density: number;
    /** average dot size in px */
    size: number;
    /** hex color string */
    color: string;
}

export interface DecorateState {
    /** object URL of the uploaded photo, or null */
    photoUrl: string | null;
    /** id of the selected paper background */
    paperId: string;
    dotConfig: DotConfig;
    /** seed used by the dot generator; reroll to reshuffle layout */
    seed: number;
}

const initialState: DecorateState = {
    photoUrl: null,
    paperId: "plain",
    dotConfig: {
        shape: "circle",
        density: 0.5,
        size: 14,
        color: "#1a1a1a",
    },
    seed: 1,
};

const decorateSlice = createSlice({
    name: "decorate",
    initialState,
    reducers: {
        setPhotoUrl(state, action: PayloadAction<string | null>) {
            state.photoUrl = action.payload;
        },
        setPaperId(state, action: PayloadAction<string>) {
            state.paperId = action.payload;
        },
        setDotShape(state, action: PayloadAction<DotShape>) {
            state.dotConfig.shape = action.payload;
        },
        setDotDensity(state, action: PayloadAction<number>) {
            state.dotConfig.density = action.payload;
        },
        setDotSize(state, action: PayloadAction<number>) {
            state.dotConfig.size = action.payload;
        },
        setDotColor(state, action: PayloadAction<string>) {
            state.dotConfig.color = action.payload;
        },
        rerollSeed(state) {
            state.seed = Math.floor(Math.random() * 2 ** 31);
        },
    },
});

export const {
    setPhotoUrl,
    setPaperId,
    setDotShape,
    setDotDensity,
    setDotSize,
    setDotColor,
    rerollSeed,
} = decorateSlice.actions;

export default decorateSlice.reducer;
