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
    /** "auto" means follow the current background representative color; "custom" uses `color` */
    colorMode: DotColorMode;
    /** hex color string; only used when colorMode === "custom" */
    color: string;
    /** text to render when shape === "character" */
    character: string;
    /** dot opacity, 0-100 */
    opacity: number;
}

export type LayoutType =
    | "main-left"
    | "main-right"
    | "main-top"
    | "main-bottom"
    | "border";

export interface LayoutConfig {
    type: LayoutType;
    /** 0 - 100, right-side width as a fraction of total canvas width */
    ratio: number;
}

export type BackgroundMode =
    | "solid"
    | "stripe"
    | "photo"
    | "checkerboard"
    | "noise"
    | "gradient"
    | "grid"
    | "dot-grid";

export interface BackgroundConfig {
    mode: BackgroundMode;
    /** hex color for solid mode (also used as base color for noise/grid/dot-grid) */
    solidColor: string;
    /** hex color for stripe color 1 */
    stripeColor1: string;
    stripeColor1Set: boolean;
    /** hex color for stripe color 2 */
    stripeColor2: string;
    stripeColor2Set: boolean;
    /** stripe width in px tile units, 1-100 */
    stripeWidth: number;
    /** object URL of the uploaded background photo, or null */
    bgPhotoUrl: string | null;
    /** checkerboard color 1 */
    checkerboardColor1: string;
    checkerboardColor1Set: boolean;
    /** checkerboard color 2 */
    checkerboardColor2: string;
    checkerboardColor2Set: boolean;
    /** checkerboard cell size in canvas px, 20-200 */
    checkerboardSize: number;
    /** noise overlay opacity, 0-100 */
    noiseOpacity: number;
    /** gradient color 1 */
    gradientColor1: string;
    gradientColor1Set: boolean;
    /** gradient color 2 */
    gradientColor2: string;
    gradientColor2Set: boolean;
    /** gradient angle in degrees, 0-360 */
    gradientAngle: number;
    /** grid line color */
    gridColor: string;
    gridColorSet: boolean;
    /** grid cell size in canvas px, 20-200 */
    gridSize: number;
    /** dot grid dot color */
    dotGridColor: string;
    dotGridColorSet: boolean;
    /** dot grid spacing in canvas px, 20-100 */
    dotGridSpacing: number;
    /** dot grid dot radius in canvas px, 1-20 */
    dotGridRadius: number;
}

export interface DecorateState {
    /** object URL of the uploaded photo, or null */
    photoUrl: string | null;
    background: BackgroundConfig;
    dotConfig: DotConfig;
    layout: LayoutConfig;
    /** seed used by the dot generator; reroll to reshuffle layout */
    seed: number;
}

const initialState: DecorateState = {
    photoUrl: null,
    background: {
        mode: "solid",
        solidColor: "#fafafa",
        stripeColor1: "#fafafa",
        stripeColor1Set: false,
        stripeColor2: "#e0e0e0",
        stripeColor2Set: false,
        stripeWidth: 20,
        bgPhotoUrl: null,
        checkerboardColor1: "#ffffff",
        checkerboardColor1Set: false,
        checkerboardColor2: "#000000",
        checkerboardColor2Set: false,
        checkerboardSize: 60,
        noiseOpacity: 15,
        gradientColor1: "#f0f0f0",
        gradientColor1Set: false,
        gradientColor2: "#b0b0b0",
        gradientColor2Set: false,
        gradientAngle: 135,
        gridColor: "#888888",
        gridColorSet: false,
        gridSize: 40,
        dotGridColor: "#888888",
        dotGridColorSet: false,
        dotGridSpacing: 30,
        dotGridRadius: 2,
    },
    dotConfig: {
        shape: "circle",
        count: 50,
        size: 14,
        variance: 0,
        colorMode: "auto",
        color: "#1a1a1a",
        character: "A",
        opacity: 100,
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
        setBackgroundMode(state, action: PayloadAction<BackgroundMode>) {
            state.background.mode = action.payload;
        },
        setSolidColor(state, action: PayloadAction<string>) {
            state.background.solidColor = action.payload;
        },
        setStripeColor1(state, action: PayloadAction<string>) {
            state.background.stripeColor1 = action.payload;
            state.background.stripeColor1Set = true;
        },
        setStripeColor2(state, action: PayloadAction<string>) {
            state.background.stripeColor2 = action.payload;
            state.background.stripeColor2Set = true;
        },
        setStripeWidth(state, action: PayloadAction<number>) {
            state.background.stripeWidth = Math.max(1, Math.min(100, action.payload));
        },
        setBgPhotoUrl(state, action: PayloadAction<string | null>) {
            state.background.bgPhotoUrl = action.payload;
        },
        setCheckerboardColor1(state, action: PayloadAction<string>) {
            state.background.checkerboardColor1 = action.payload;
            state.background.checkerboardColor1Set = true;
        },
        setCheckerboardColor2(state, action: PayloadAction<string>) {
            state.background.checkerboardColor2 = action.payload;
            state.background.checkerboardColor2Set = true;
        },
        setCheckerboardSize(state, action: PayloadAction<number>) {
            state.background.checkerboardSize = Math.max(20, Math.min(200, action.payload));
        },
        setNoiseOpacity(state, action: PayloadAction<number>) {
            state.background.noiseOpacity = Math.max(0, Math.min(100, action.payload));
        },
        setGradientColor1(state, action: PayloadAction<string>) {
            state.background.gradientColor1 = action.payload;
            state.background.gradientColor1Set = true;
        },
        setGradientColor2(state, action: PayloadAction<string>) {
            state.background.gradientColor2 = action.payload;
            state.background.gradientColor2Set = true;
        },
        setGradientAngle(state, action: PayloadAction<number>) {
            state.background.gradientAngle = Math.max(0, Math.min(360, action.payload));
        },
        setGridColor(state, action: PayloadAction<string>) {
            state.background.gridColor = action.payload;
            state.background.gridColorSet = true;
        },
        setGridSize(state, action: PayloadAction<number>) {
            state.background.gridSize = Math.max(20, Math.min(200, action.payload));
        },
        setDotGridColor(state, action: PayloadAction<string>) {
            state.background.dotGridColor = action.payload;
            state.background.dotGridColorSet = true;
        },
        setDotGridSpacing(state, action: PayloadAction<number>) {
            state.background.dotGridSpacing = Math.max(20, Math.min(100, action.payload));
        },
        setDotGridRadius(state, action: PayloadAction<number>) {
            state.background.dotGridRadius = Math.max(1, Math.min(20, action.payload));
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
        setDotOpacity(state, action: PayloadAction<number>) {
            state.dotConfig.opacity = Math.max(0, Math.min(100, action.payload));
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
    setBackgroundMode,
    setSolidColor,
    setStripeColor1,
    setStripeColor2,
    setStripeWidth,
    setBgPhotoUrl,
    setCheckerboardColor1,
    setCheckerboardColor2,
    setCheckerboardSize,
    setNoiseOpacity,
    setGradientColor1,
    setGradientColor2,
    setGradientAngle,
    setGridColor,
    setGridSize,
    setDotGridColor,
    setDotGridSpacing,
    setDotGridRadius,
    setDotShape,
    setDotCount,
    setDotSize,
    setDotVariance,
    setDotColor,
    setDotColorMode,
    setDotOpacity,
    setLayoutType,
    setLayoutRatio,
    setCharacter,
    rerollSeed,
} = decorateSlice.actions;

export default decorateSlice.reducer;
