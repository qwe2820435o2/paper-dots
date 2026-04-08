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

export type DotColorMode = "auto" | "custom";

export interface DotConfig {
    shape: DotShape;
    /** 0 - 100, exact number of dots to render */
    count: number;
    /** average dot size in px */
    size: number;
    /** 0 - 100, controls size variation between dots */
    variance: number;
    /** "auto" means follow the current paper color; "custom" uses `color` */
    colorMode: DotColorMode;
    /** hex color string; only used when colorMode === "custom" */
    color: string;
    /** text to render when shape === "character" */
    character: string;
}

export type LayoutType = "main-left";

export interface LayoutConfig {
    type: LayoutType;
    /** 0 - 100, right-side width as a fraction of total canvas width */
    ratio: number;
}

export interface DecorateState {
    /** object URL of the uploaded photo, or null */
    photoUrl: string | null;
    /** id of the selected paper background */
    paperId: string;
    dotConfig: DotConfig;
    layout: LayoutConfig;
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
        colorMode: "auto",
        color: "#1a1a1a",
        character: "A",
    },
    layout: {
        type: "main-left",
        ratio: 50,
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
            state.dotConfig.colorMode = "custom";
        },
        setDotColorMode(state, action: PayloadAction<DotColorMode>) {
            state.dotConfig.colorMode = action.payload;
        },
        setLayoutType(state, action: PayloadAction<LayoutType>) {
            state.layout.type = action.payload;
        },
        setLayoutRatio(state, action: PayloadAction<number>) {
            const v = Math.max(0, Math.min(100, action.payload));
            state.layout.ratio = v;
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
    setDotColorMode,
    setLayoutType,
    setLayoutRatio,
    setCharacter,
    rerollSeed,
} = decorateSlice.actions;

export default decorateSlice.reducer;
