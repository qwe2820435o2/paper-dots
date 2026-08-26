import type { AppDispatch, RootState } from "@/store";
import { setPhoto, resetMomentCard } from "@/store/slices/momentCardSlice";
import { extractDominantColorVivid } from "@/lib/extractDominantColor";
import { createTrackedObjectUrl, revokeTrackedObjectUrl } from "@/lib/objectUrl";

function loadImageEl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("image load failed"));
        img.src = url;
    });
}

/** Loads a photo into the "Moment Card" editor's store: object-URL the file, load it to read
 *  its natural size, pull a vivid dominant color, and write all of it into `momentCardSlice`.
 *  Shared by the in-page uploader and any button that uploads-then-navigates to
 *  /create/moment-card.
 *
 *  A thunk rather than a plain function because it has to read the URL it is about to overwrite:
 *  that blob stays in memory until it is revoked (see `objectUrl`). */
export function applyMomentCardPhoto(file: File) {
    return async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
        const previous = getState().momentCard.photoUrl;
        const url = createTrackedObjectUrl(file);
        const img = await loadImageEl(url);
        const color = extractDominantColorVivid(img);
        dispatch(setPhoto({
            url,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            bgColor: color,
        }));
        revokeTrackedObjectUrl(previous);
    };
}

/** Start over: the photo freed, every setting back to its default. */
export function resetMomentCardEditor() {
    return (dispatch: AppDispatch, getState: () => RootState): void => {
        const { photoUrl } = getState().momentCard;
        dispatch(resetMomentCard());
        revokeTrackedObjectUrl(photoUrl);
    };
}
