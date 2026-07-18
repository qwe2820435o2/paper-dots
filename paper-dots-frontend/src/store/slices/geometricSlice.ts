import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_ICON_SET_ID } from "@/lib/geometricIconSets";
import type { GeometricConfig } from "@/lib/geometricGrid";

export type GeometricState = GeometricConfig;

// backgroundColor defaults to a non-white color so the fixed cutout white (see
// geometricGrid.ts's CUTOUT_COLOR) is actually visible out of the box — a white background
// would make every white-cutout shape invisible against it.
const initialState: GeometricState = {
    iconSetId: DEFAULT_ICON_SET_ID,
    rows: 3,
    columns: 4,
    backgroundColor: "#1a1a2e",
    frontColor: "#9ED06C",
    seed: 1,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function randomSeed(): number {
    return Math.floor(Math.random() * 2 ** 31);
}

const geometricSlice = createSlice({
    name: "geometric",
    initialState,
    reducers: {
        setIconSetId(state, action: PayloadAction<string>) {
            state.iconSetId = action.payload;
        },
        setRows(state, action: PayloadAction<number>) {
            state.rows = clamp(Math.round(action.payload), 1, 12);
        },
        setColumns(state, action: PayloadAction<number>) {
            state.columns = clamp(Math.round(action.payload), 1, 12);
        },
        setBackgroundColor(state, action: PayloadAction<string>) {
            state.backgroundColor = action.payload;
        },
        setFrontColor(state, action: PayloadAction<string>) {
            state.frontColor = action.payload;
        },
        shuffle(state) {
            state.seed = randomSeed();
        },
        resetGeometric() {
            return initialState;
        },
    },
});

export const {
    setIconSetId,
    setRows,
    setColumns,
    setBackgroundColor,
    setFrontColor,
    shuffle,
    resetGeometric,
} = geometricSlice.actions;

export default geometricSlice.reducer;
