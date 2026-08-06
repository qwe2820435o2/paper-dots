import type { CSSProperties } from "react";

/** home-desktop.html's own `h2{font-size:clamp(30px,2.8vw,42px)}` — a few px larger than
 *  `.guide-scope h2`, which was tuned for the narrower guide-page hero column. Shared here so
 *  every home section overrides it the same way instead of repeating the clamp() string. */
export const HOME_H2_STYLE: CSSProperties = { fontSize: "clamp(30px, 2.8vw, 42px)" };
