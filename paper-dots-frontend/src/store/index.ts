import { configureStore } from "@reduxjs/toolkit";
import decorateReducer from "./slices/decorateSlice";
import momentCardReducer from "./slices/momentCardSlice";

export const store = configureStore({
    reducer: {
        decorate: decorateReducer,
        momentCard: momentCardReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
