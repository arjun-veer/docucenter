"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
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
    <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Admin Portal Error</h2>
        <p className="text-sm text-muted-foreground md:max-w-[500px]">
          Something went wrong while loading this admin page. Please try again or contact support if the issue persists.
        </p>
      </div>
      <Button onClick={() => reset()} size="lg">
        Try again
      </Button>
    </div>
  );
}