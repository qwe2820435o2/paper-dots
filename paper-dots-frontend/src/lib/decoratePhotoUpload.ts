import type { AppDispatch, RootState } from "@/store";
import {
    setBackgroundMode,
    setDotOpacity,
    setDotShape,
    setDotSize,
    setDotVariance,
    setPhotoUrl,
    setBgPhotoUrl,
    setSolidColor,
    resetDecorate,
} from "@/store/slices/decorateSlice";
import { extractPhotoColor } from "@/lib/extractDominantColor";
import { createTrackedObjectUrl, revokeTrackedObjectUrl } from "@/lib/objectUrl";

/** Loads a photo into the "Dots" editor's store: object-URL the file, pull its dominant color,
 *  and apply the same solid-background + snowflake defaults `PhotoUploader` has always used.
 *  Shared by the in-page uploader and any button that uploads-then-navigates to /create/dot.
 *
 *  A thunk rather than a plain function because it has to read the URL it is about to overwrite:
 *  that blob stays in memory until it is revoked (see `objectUrl`). */
export function applyDecoratePhoto(file: File) {
    return async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
        const previous = getState().decorate.photoUrl;
        const url = createTrackedObjectUrl(file);
        const color = await extractPhotoColor(url);
        dispatch(setBackgroundMode("solid"));
        dispatch(setSolidColor(color));
        dispatch(setPhotoUrl(url));
        dispatch(setDotShape("snowflake"));
        dispatch(setDotSize(30));
        dispatch(setDotVariance(23));
        dispatch(setDotOpacity(66));
        revokeTrackedObjectUrl(previous);
    };
}

/** Replaces the background photo, freeing the one it displaces. */
export function applyDecorateBgPhoto(file: File) {
    return (dispatch: AppDispatch, getState: () => RootState): void => {
        const previous = getState().decorate.background.bgPhotoUrl;
        dispatch(setBgPhotoUrl(createTrackedObjectUrl(file)));
        revokeTrackedObjectUrl(previous);
    };
}

/** Start over: both photos freed, every setting back to its default. */
export function resetDecorateEditor() {
    return (dispatch: AppDispatch, getState: () => RootState): void => {
        const { photoUrl, background } = getState().decorate;
        dispatch(resetDecorate());
        revokeTrackedObjectUrl(photoUrl);
        revokeTrackedObjectUrl(background.bgPhotoUrl);
    };
}
