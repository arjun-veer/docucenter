"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileWarning } from "lucide-react";
import Link from "next/link";

export default function PublicError({
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
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-20 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-8">
        <FileWarning className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Something went wrong!</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
        We encountered an error while trying to load this page. Our team has been notified.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} size="lg">
          Try again
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}