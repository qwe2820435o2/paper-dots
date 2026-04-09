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
}

export type LayoutType = "main-left" | "main-right" | "main-top" | "main-bottom";

export interface LayoutConfig {
    type: LayoutType;
    /** 0 - 100, right-side width as a fraction of total canvas width */
    ratio: number;
}

export type BackgroundMode = "solid" | "stripe" | "photo" | "template";

export interface BackgroundConfig {
    mode: BackgroundMode;
    /** hex color for solid mode */
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
    /** paper template id for template mode */
    templateId: string;
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
        mode: "template",
        solidColor: "#fafafa",
        stripeColor1: "#fafafa",
        stripeColor1Set: false,
        stripeColor2: "#e0e0e0",
        stripeColor2Set: false,
        stripeWidth: 20,
        bgPhotoUrl: null,
        templateId: "plain",
    },
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
        setTemplateId(state, action: PayloadAction<string>) {
            state.background.templateId = action.payload;
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
    setBackgroundMode,
    setSolidColor,
    setStripeColor1,
    setStripeColor2,
    setStripeWidth,
    setBgPhotoUrl,
    setTemplateId,
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
