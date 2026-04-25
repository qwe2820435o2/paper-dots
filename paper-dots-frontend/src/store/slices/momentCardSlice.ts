import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TextColorMode = "auto" | "light" | "dark";

export interface MomentCardState {
    photoUrl: string | null;
    photoNaturalWidth: number;
    photoNaturalHeight: number;
    /**
     * Vertical pan offset for the photo within the bottom crop frame.
     * 0 = top of the photo aligned to top of frame; 1 = bottom aligned to bottom.
     * Only used when the scaled photo is taller than the frame.
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
            state.cropOffsetY = 0.5;
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
    setCropOffsetY,
    setBgColor,
    setTitle,
    setSubtitle,
    setTextColorMode,
    resetMomentCard,
} = momentCardSlice.actions;

export default momentCardSlice.reducer;
