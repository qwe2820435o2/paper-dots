import type { AppDispatch, RootState } from "@/store";
import {
    setBeforeUrl,
    setAfterUrl,
    resetAfterTransform,
    resetBeforeAfter,
} from "@/store/slices/beforeAfterSlice";
import { createTrackedObjectUrl, revokeTrackedObjectUrl } from "@/lib/objectUrl";

export type BeforeAfterSlot = "before" | "after";

function slotUrl(state: RootState, slot: BeforeAfterSlot): string | null {
    return slot === "before" ? state.beforeAfter.beforeUrl : state.beforeAfter.afterUrl;
}

/** Loads a photo into the "Before & After" editor's store: object-URL the file and dispatch it
 *  into the slot the caller uploaded to. Shared by both dropzones in `BeforeAfterUploader`.
 *
 *  The manual alignment nudge is always cleared alongside. It is calibrated against one specific
 *  pair of photos, so carrying it over to a replacement — of either slot — would silently offset
 *  the new photo. Callers warn the user when there was an alignment worth losing.
 *
 *  A thunk rather than a plain function because it has to read the URL it is about to overwrite:
 *  that blob stays in memory until it is revoked (see `objectUrl`). */
export function applyBeforeAfterPhoto(file: File, slot: BeforeAfterSlot) {
    return (dispatch: AppDispatch, getState: () => RootState): void => {
        const previous = slotUrl(getState(), slot);
        const url = createTrackedObjectUrl(file);
        dispatch(slot === "before" ? setBeforeUrl(url) : setAfterUrl(url));
        dispatch(resetAfterTransform());
        revokeTrackedObjectUrl(previous);
    };
}

/** Empties one slot, freeing its photo and clearing the now-meaningless alignment (see above). */
export function clearBeforeAfterPhoto(slot: BeforeAfterSlot) {
    return (dispatch: AppDispatch, getState: () => RootState): void => {
        const previous = slotUrl(getState(), slot);
        dispatch(slot === "before" ? setBeforeUrl(null) : setAfterUrl(null));
        dispatch(resetAfterTransform());
        revokeTrackedObjectUrl(previous);
    };
}

/** Start over: both photos freed, every setting back to its default. */
export function resetBeforeAfterEditor() {
    return (dispatch: AppDispatch, getState: () => RootState): void => {
        const { beforeUrl, afterUrl } = getState().beforeAfter;
        dispatch(resetBeforeAfter());
        revokeTrackedObjectUrl(beforeUrl);
        revokeTrackedObjectUrl(afterUrl);
    };
}
