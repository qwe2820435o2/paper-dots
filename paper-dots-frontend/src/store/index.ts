import { configureStore } from "@reduxjs/toolkit";
import decorateReducer from "./slices/decorateSlice";
import momentCardReducer from "./slices/momentCardSlice";
import polkaDotReducer from "./slices/polkaDotSlice";
import geometricReducer from "./slices/geometricSlice";
import beforeAfterReducer from "./slices/beforeAfterSlice";
import { persistGeometricState } from "./persistGeometric";

// No preloadedState from localStorage here: the store module also runs during SSR (where
// localStorage doesn't exist), and seeding it only on the client would make the first client
// render disagree with the server-rendered HTML (a hydration mismatch). Rehydration instead
// happens client-side, after mount, in Providers.tsx.
export const store = configureStore({
    reducer: {
        decorate: decorateReducer,
        momentCard: momentCardReducer,
        polkaDot: polkaDotReducer,
        geometric: geometricReducer,
        beforeAfter: beforeAfterReducer,
    },
});

// Debounced so dragging a slider doesn't write to localStorage on every tick.
let persistTimer: ReturnType<typeof setTimeout> | undefined;
store.subscribe(() => {
    if (typeof window === "undefined") return;
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
        persistGeometricState(store.getState().geometric);
    }, 300);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
