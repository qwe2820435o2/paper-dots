import Link from "next/link";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
        <Camera className="w-7 h-7 text-primary-foreground" />
      </div>
      <h1 className="text-6xl font-black text-foreground mb-3">404</h1>
      <p className="text-xl font-semibold text-foreground mb-2">Page not found</p>
      <p className="text-muted-foreground mb-8 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button className="rounded-full px-6">Back to Home</Button>
        </Link>
        <Link href="/decorate">
          <Button variant="outline" className="rounded-full px-6">Start Decorating</Button>
        </Link>
      </div>
    </div>
  );
}
