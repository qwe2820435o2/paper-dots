import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TextColorMode = "auto" | "light" | "dark";

export interface MomentCardState {
    photoUrl: string | null;
    photoNaturalWidth: number;
    photoNaturalHeight: number;
    /**
     * Horizontal pan offset for the photo within the bottom crop frame.
     * 0 = left edge aligned to frame; 1 = right edge aligned to frame.
     */
    cropOffsetX: number;
    /**
     * Vertical pan offset for the photo within the bottom crop frame.
     * 0 = top edge aligned to frame; 1 = bottom edge aligned to frame.
     */
    cropOffsetY: number;
    bgColor: string;
    textColorMode: TextColorMode;
    title: string;
    subtitle: string;
}

const initialState: MomentCardState = {
    photoUrl: null,
    photoNaturalWidth: 0,
    photoNaturalHeight: 0,
    cropOffsetX: 0.5,
    cropOffsetY: 0.5,
    bgColor: "#C5E89A",
    textColorMode: "auto",
    title: "Moment title",
    subtitle: "Tap here to add subtitle",
};

interface PhotoPayload {
    url: string;
    naturalWidth: number;
    naturalHeight: number;
    bgColor: string;
}

const momentCardSlice = createSlice({
    name: "momentCard",
    initialState,
    reducers: {
        setPhoto(state, action: PayloadAction<PhotoPayload>) {
            state.photoUrl = action.payload.url;
            state.photoNaturalWidth = action.payload.naturalWidth;
            state.photoNaturalHeight = action.payload.naturalHeight;
            state.bgColor = action.payload.bgColor;
            state.cropOffsetX = 0.5;
            state.cropOffsetY = 0.5;
        },
        setCropOffset(state, action: PayloadAction<{ x: number; y: number }>) {
            state.cropOffsetX = Math.max(0, Math.min(1, action.payload.x));
            state.cropOffsetY = Math.max(0, Math.min(1, action.payload.y));
        },
        setCropOffsetY(state, action: PayloadAction<number>) {
            state.cropOffsetY = Math.max(0, Math.min(1, action.payload));
        },
        setBgColor(state, action: PayloadAction<string>) {
            state.bgColor = action.payload;
        },
        setTitle(state, action: PayloadAction<string>) {
            state.title = action.payload;
        },
        setSubtitle(state, action: PayloadAction<string>) {
            state.subtitle = action.payload;
        },
        setTextColorMode(state, action: PayloadAction<TextColorMode>) {
            state.textColorMode = action.payload;
        },
        resetMomentCard() {
            return initialState;
        },
    },
});

export const {
    setPhoto,
    setCropOffset,
    setCropOffsetY,
    setBgColor,
    setTitle,
    setSubtitle,
    setTextColorMode,
    resetMomentCard,
} = momentCardSlice.actions;

export default momentCardSlice.reducer;
