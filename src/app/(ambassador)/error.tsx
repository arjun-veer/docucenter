"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AmbassadorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center bg-card rounded-lg border shadow-sm">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">Ambassador Portal Error</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        We encountered an issue loading your ambassador dashboard. Please try refreshing.
      </p>
      <Button onClick={() => reset()} variant="outline">
        Reload Page
      </Button>
    </div>
  );
}