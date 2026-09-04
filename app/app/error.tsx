"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="font-display text-2xl font-black text-foreground">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        {error?.message || "An unexpected error occurred while loading this page."}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => reset()} className="gap-2 font-bold">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Go to Homepage
        </Button>
      </div>
    </div>
  );
}
