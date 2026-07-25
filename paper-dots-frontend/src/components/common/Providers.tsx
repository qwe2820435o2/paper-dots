"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { hydrateGeometric } from "@/store/slices/geometricSlice";
import { loadPersistedGeometricState } from "@/store/persistGeometric";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Runs once after mount (client-only) so the initial render always matches the
  // server-rendered defaults; see store/index.ts for why this isn't done synchronously.
  useEffect(() => {
    const persisted = loadPersistedGeometricState();
    if (persisted) {
      store.dispatch(hydrateGeometric(persisted));
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
