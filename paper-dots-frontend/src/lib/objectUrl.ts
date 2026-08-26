/** Object URLs created for uploaded photos.
 *
 *  An object URL pins its blob in memory until it is explicitly revoked — closing the tab is
 *  the only other thing that frees it. The editors keep these URLs in the redux store and
 *  overwrite them whenever a photo is replaced, so without a revoke on the way out every swap
 *  strands another full-size image in memory for the rest of the session.
 *
 *  Revoking is deliberately tied to *replacement*, never to a component unmounting: the store
 *  is a module-level singleton that outlives client-side navigation, and the "upload here, then
 *  land in the editor" flow depends on a URL surviving a route change. Freeing on unmount would
 *  leave the store holding a dead URL and the editor showing a broken image on the way back.
 *
 *  The tracking set is what makes `revokeTrackedObjectUrl` safe to hand anything the store
 *  might be holding — a data URL from the polka-dot icon builder, a path to a bundled asset,
 *  null — since only URLs this module minted are ever passed to `URL.revokeObjectURL`. */
const tracked = new Set<string>();

export function createTrackedObjectUrl(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    tracked.add(url);
    return url;
}

/** Frees `url` if this module created it; a no-op for anything else, including null. Call it
 *  after the replacement URL is in the store, so nothing is ever rendering a revoked URL. */
export function revokeTrackedObjectUrl(url: string | null | undefined): void {
    if (!url || !tracked.has(url)) return;
    URL.revokeObjectURL(url);
    tracked.delete(url);
}
