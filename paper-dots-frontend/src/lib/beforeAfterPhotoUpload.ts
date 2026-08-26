import type { AppDispatch } from "@/store";
import { setBeforeUrl, setAfterUrl } from "@/store/slices/beforeAfterSlice";

export type BeforeAfterSlot = "before" | "after";

/** Loads a photo into the "Before & After" editor's store: object-URL the file and dispatch it
 *  into the slot the caller uploaded to. Shared by both dropzones in `BeforeAfterUploader`. */
export function applyBeforeAfterPhoto(dispatch: AppDispatch, file: File, slot: BeforeAfterSlot): void {
    const url = URL.createObjectURL(file);
    dispatch(slot === "before" ? setBeforeUrl(url) : setAfterUrl(url));
}
