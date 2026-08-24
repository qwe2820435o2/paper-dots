"use client";

import "./globals.css";

/** Catches errors thrown while rendering the root layout (`[locale]/layout.tsx`) itself,
 *  which sit above `[locale]/error.tsx` and would otherwise show Next's default error
 *  screen. Sits above the root layout, so it has to supply its own `<html>`/`<body>` and
 *  cannot use translations (no locale has been resolved yet) — same constraint as
 *  `not-found.tsx`. */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-6xl font-black text-foreground mb-3">500</h1>
          <p className="text-xl font-semibold text-foreground mb-2">
            Something went wrong
          </p>
          <p className="text-muted-foreground mb-8 max-w-sm">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="rounded-full px-6 py-2 bg-primary text-primary-foreground font-medium"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
