import type { AppDispatch } from "@/store";
import { setPhoto } from "@/store/slices/momentCardSlice";
import { extractDominantColorVivid } from "@/lib/extractDominantColor";

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
 *  /create/moment-card. */
export async function applyMomentCardPhoto(dispatch: AppDispatch, file: File): Promise<void> {
    const url = URL.createObjectURL(file);
    const img = await loadImageEl(url);
    const color = extractDominantColorVivid(img);
    dispatch(setPhoto({
        url,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        bgColor: color,
    }));
}
