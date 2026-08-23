import type { AppDispatch } from "@/store";
import {
    setBackgroundMode,
    setDotOpacity,
    setDotShape,
    setDotSize,
    setDotVariance,
    setPhotoUrl,
    setSolidColor,
} from "@/store/slices/decorateSlice";
import { extractPhotoColor } from "@/lib/extractDominantColor";

/** Loads a photo into the "Dots" editor's store: object-URL the file, pull its dominant color,
 *  and apply the same solid-background + snowflake defaults `PhotoUploader` has always used.
 *  Shared by the in-page uploader and any button that uploads-then-navigates to /create/dot. */
export async function applyDecoratePhoto(dispatch: AppDispatch, file: File): Promise<void> {
    const url = URL.createObjectURL(file);
    const color = await extractPhotoColor(url);
    dispatch(setBackgroundMode("solid"));
    dispatch(setSolidColor(color));
    dispatch(setPhotoUrl(url));
    dispatch(setDotShape("snowflake"));
    dispatch(setDotSize(30));
    dispatch(setDotVariance(23));
    dispatch(setDotOpacity(66));
}
