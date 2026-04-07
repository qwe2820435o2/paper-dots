import { configureStore } from "@reduxjs/toolkit";
import boothReducer from "./slices/boothSlice";
import editReducer from "./slices/editSlice";

export const store = configureStore({
    reducer: {
        booth: boothReducer,
        edit: editReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;