import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type DotShape =
    | "circle"
    | "square"
    | "character"
    | "teardrop"
    | "heart"
    | "star"
    | "hexagon"
    | "leaf"
    | "crescent";

export interface DotConfig {
    shape: DotShape;
    /** 0 - 100, exact number of dots to render */
    count: number;
    /** average dot size in px */
    size: number;
    /** 0 - 100, controls size variation between dots */
    variance: number;
    /** hex color string */
    color: string;
    /** text to render when shape === "character" */
    character: string;
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
        count: 50,
        size: 14,
        variance: 0,
        color: "#1a1a1a",
        character: "A",
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
        setDotCount(state, action: PayloadAction<number>) {
            state.dotConfig.count = action.payload;
        },
        setDotSize(state, action: PayloadAction<number>) {
            state.dotConfig.size = action.payload;
        },
        setDotVariance(state, action: PayloadAction<number>) {
            state.dotConfig.variance = action.payload;
        },
        setCharacter(state, action: PayloadAction<string>) {
            state.dotConfig.character = action.payload;
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
    setDotCount,
    setDotSize,
    setDotVariance,
    setDotColor,
    setCharacter,
    rerollSeed,
} = decorateSlice.actions;

export default decorateSlice.reducer;
