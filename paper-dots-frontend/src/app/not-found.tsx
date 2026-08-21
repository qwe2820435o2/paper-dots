import Link from "next/link";
import "./globals.css";

/** Global 404 for requests that never reach a locale segment — the i18n middleware skips
 *  anything with a file extension, so a stray `/foo.php` lands here rather than in
 *  `[locale]/not-found.tsx`. It sits above the root layout, which means it has to supply its
 *  own `<html>`/`<body>` and cannot use translations (no locale has been resolved yet). */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-6xl font-black text-foreground mb-3">404</h1>
          <p className="text-xl font-semibold text-foreground mb-2">Page not found</p>
          <p className="text-muted-foreground mb-8 max-w-sm">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link href="/" className="underline">
            Back to Home
          </Link>
        </div>
      </body>
    </html>
  );
}
