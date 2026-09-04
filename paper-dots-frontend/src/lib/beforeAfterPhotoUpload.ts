import type { AppDispatch, RootState } from "@/store";
import {
    setBeforeUrl,
    setAfterUrl,
    resetTransform,
    setLogoUrl,
    resetBeforeAfter,
    type BeforeAfterSlot,
} from "@/store/slices/beforeAfterSlice";
import { createTrackedObjectUrl, revokeTrackedObjectUrl } from "@/lib/objectUrl";

export type { BeforeAfterSlot } from "@/store/slices/beforeAfterSlice";

function slotUrl(state: RootState, slot: BeforeAfterSlot): string | null {
    return slot === "before" ? state.beforeAfter.beforeUrl : state.beforeAfter.afterUrl;
}

/** Loads a photo into the "Before & After" editor's store: object-URL the file and dispatch it
 *  into the slot the caller uploaded to. Shared by both dropzones in `BeforeAfterUploader`.
 *
 *  The slot's crop is always reset alongside. It is calibrated against one specific photo, so
 *  carrying it over to a replacement would silently offset the new one. Callers warn the user
 *  when there was a crop worth losing.
 *
 *  A thunk rather than a plain function because it has to read the URL it is about to overwrite:
 *  that blob stays in memory until it is revoked (see `objectUrl`). */
export function applyBeforeAfterPhoto(file: File, slot: BeforeAfterSlot) {
    return (dispatch: AppDispatch, getState: () => RootState): void => {
        const previous = slotUrl(getState(), slot);
        const url = createTrackedObjectUrl(file);
        dispatch(slot === "before" ? setBeforeUrl(url) : setAfterUrl(url));
        dispatch(resetTransform(slot));
        revokeTrackedObjectUrl(previous);
    };
}

/** Empties one slot, freeing its photo and clearing the now-meaningless crop (see above). */
export function clearBeforeAfterPhoto(slot: BeforeAfterSlot) {
    return (dispatch: AppDispatch, getState: () => RootState): void => {
        const previous = slotUrl(getState(), slot);
        dispatch(slot === "before" ? setBeforeUrl(null) : setAfterUrl(null));
        dispatch(resetTransform(slot));
        revokeTrackedObjectUrl(previous);
    };
}

/** Loads a brand logo into the store, replacing any previous one. */
export function applyBeforeAfterLogo(file: File) {
    return (dispatch: AppDispatch, getState: () => RootState): void => {
        const previous = getState().beforeAfter.logo.url;
        const url = createTrackedObjectUrl(file);
        dispatch(setLogoUrl(url));
        revokeTrackedObjectUrl(previous);
    };
}

/** Removes the brand logo, freeing its object URL. */
export function clearBeforeAfterLogo() {
    return (dispatch: AppDispatch, getState: () => RootState): void => {
        const previous = getState().beforeAfter.logo.url;
        dispatch(setLogoUrl(null));
        revokeTrackedObjectUrl(previous);
    };
}

/** Start over: photos and logo freed, every setting back to its default. */
export function resetBeforeAfterEditor() {
    return (dispatch: AppDispatch, getState: () => RootState): void => {
        const { beforeUrl, afterUrl, logo } = getState().beforeAfter;
        dispatch(resetBeforeAfter());
        revokeTrackedObjectUrl(beforeUrl);
        revokeTrackedObjectUrl(afterUrl);
        revokeTrackedObjectUrl(logo.url);
    };
}
