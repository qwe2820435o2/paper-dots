import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_ICON_SET_ID } from "@/lib/geometricIconSets";
import type { GeometricConfig, GridStyle } from "@/lib/geometricGrid";

export type ExportFormat = "svg" | "png" | "jpeg";

// The Export panel's width/height/format live here (not in local component state) because the
// page shell mounts a desktop and a mobile copy of the panel at the same time (CSS-hidden, not
// unmounted) — independent useState in each copy would silently diverge whenever the viewport
// crosses the md breakpoint. Redux gives both copies the same value for free.
export type GeometricState = GeometricConfig & {
    exportWidth: number;
    exportHeight: number;
    exportFormat: ExportFormat;
};

// backgroundColor defaults to a non-white color so the fixed cutout white (see
// geometricGrid.ts's CUTOUT_COLOR) is actually visible out of the box — a white background
// would make every white-cutout shape invisible against it.
const initialState: GeometricState = {
    iconSetId: DEFAULT_ICON_SET_ID,
    rows: 3,
    columns: 4,
    gridStyle: "even",
    backgroundColor: "#1a1a2e",
    frontColor: "#9ED06C",
    seed: 1,
    density: 100,
    spacing: 0,
    rotation: 0,
    opacity: 100,
    randomizeRotation: false,
    randomizeSpacing: false,
    // Proportional to the default 3:4 rows:columns so cells export square by default, same as
    // the live preview.
    exportWidth: 800,
    exportHeight: 600,
    exportFormat: "svg",
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
        setGridStyle(state, action: PayloadAction<GridStyle>) {
            state.gridStyle = action.payload;
        },
        setBackgroundColor(state, action: PayloadAction<string>) {
            state.backgroundColor = action.payload;
        },
        setFrontColor(state, action: PayloadAction<string>) {
            state.frontColor = action.payload;
        },
        setColorPair(state, action: PayloadAction<{ background: string; front: string }>) {
            state.backgroundColor = action.payload.background;
            state.frontColor = action.payload.front;
        },
        setDensity(state, action: PayloadAction<number>) {
            state.density = clamp(Math.round(action.payload), 0, 100);
        },
        setSpacing(state, action: PayloadAction<number>) {
            state.spacing = clamp(Math.round(action.payload), 0, 100);
        },
        setRotation(state, action: PayloadAction<number>) {
            state.rotation = clamp(Math.round(action.payload), 0, 360);
        },
        setOpacity(state, action: PayloadAction<number>) {
            state.opacity = clamp(Math.round(action.payload), 0, 100);
        },
        setRandomizeRotation(state, action: PayloadAction<boolean>) {
            state.randomizeRotation = action.payload;
        },
        setRandomizeSpacing(state, action: PayloadAction<boolean>) {
            state.randomizeSpacing = action.payload;
        },
        setExportWidth(state, action: PayloadAction<number>) {
            state.exportWidth = action.payload;
        },
        setExportHeight(state, action: PayloadAction<number>) {
            state.exportHeight = action.payload;
        },
        setExportFormat(state, action: PayloadAction<ExportFormat>) {
            state.exportFormat = action.payload;
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
    setGridStyle,
    setBackgroundColor,
    setFrontColor,
    setColorPair,
    setDensity,
    setSpacing,
    setRotation,
    setOpacity,
    setRandomizeRotation,
    setRandomizeSpacing,
    setExportWidth,
    setExportHeight,
    setExportFormat,
    shuffle,
    resetGeometric,
} = geometricSlice.actions;

export default geometricSlice.reducer;
