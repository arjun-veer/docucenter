"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AuthError({
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-2" />
          <h1 className="text-2xl font-semibold tracking-tight">Authentication Error</h1>
          <p className="text-sm text-muted-foreground">
            There was a problem authenticating your request.
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button onClick={() => reset()} className="w-full">
            Try again
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}