"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BoxSelect } from "lucide-react";

export default function DashboardError({
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
    <div className="flex flex-col items-center justify-center h-[70vh] w-full text-center px-4">
      <div className="bg-destructive/10 p-4 rounded-full mb-6">
        <BoxSelect className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        We couldn&apos;t load this part of your dashboard. Please try again.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Page
        </Button>
      </div>
    </div>
  );
}