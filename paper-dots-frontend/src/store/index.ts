import { configureStore } from "@reduxjs/toolkit";
import decorateReducer from "./slices/decorateSlice";

export const store = configureStore({
    reducer: {
        decorate: decorateReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
