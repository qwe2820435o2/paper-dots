"use client";

import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
        <Camera className="w-7 h-7 text-primary-foreground" />
      </div>
      <h1 className="text-6xl font-black text-foreground mb-3">Oops</h1>
      <p className="text-xl font-semibold text-foreground mb-2">Something went wrong</p>
      <p className="text-muted-foreground mb-8 max-w-sm">
        An unexpected error occurred. Please try again.
      </p>
      <div className="flex gap-3">
        <Button className="rounded-full px-6" onClick={reset}>
          Try Again
        </Button>
        <Button
          variant="outline"
          className="rounded-full px-6"
          onClick={() => (window.location.href = "/")}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
