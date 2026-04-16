"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  hasMore: boolean;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

/**
 * Reusable pagination component with previous/next controls.
 * Matches the pagination pattern already used across the app.
 */
export function Pagination({
  currentPage,
  hasMore,
  onPrevious,
  onNext,
  className = "",
}: PaginationProps) {
  if (currentPage === 0 && !hasMore) return null;

  return (
    <div
      className={`flex items-center justify-center gap-4 mt-8 ${className}`}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={currentPage === 0}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {currentPage + 1}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!hasMore}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
