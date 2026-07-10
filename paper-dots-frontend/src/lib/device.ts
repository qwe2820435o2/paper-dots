/**
 * True on devices whose primary input is touch (phones/tablets), false for mouse/trackpad
 * ("fine pointer") devices — including laptops that happen to have a touchscreen.
 *
 * Used to gate the Web Share API's file-sharing path: on many desktop browsers (notably
 * desktop Chrome without a registered share target for the file type), `navigator.share`
 * with files silently resolves without actually sharing anything, which would swallow the
 * real `<a download>` fallback entirely. Gating share attempts to touch-primary devices
 * keeps the native share sheet on mobile while always downloading a real file on desktop.
 */
export function isTouchPrimaryDevice(): boolean {
    return typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches === true;
}
