import type { GeometricState } from "./slices/geometricSlice";

// Bump the suffix if GeometricState's shape changes in a way old persisted data wouldn't
// satisfy, so stale localStorage entries get ignored instead of silently corrupting state.
const STORAGE_KEY = "geometric-patterns:v1";

export function loadPersistedGeometricState(): GeometricState | undefined {
    if (typeof window === "undefined") return undefined;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return undefined;
        return JSON.parse(raw) as GeometricState;
    } catch {
        return undefined;
    }
}

export function persistGeometricState(state: GeometricState): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Ignore quota/security errors — persistence is a nice-to-have, not critical.
    }
}
