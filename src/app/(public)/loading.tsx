import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function PublicLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 space-y-8 py-20">
      <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
      <div className="space-y-4 max-w-3xl w-full mx-auto text-center">
        <Skeleton className="h-12 w-2/3 mx-auto mb-6" />
        <Skeleton className="h-6 w-full max-w-md mx-auto" />
        <Skeleton className="h-6 w-full max-w-sm mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto mt-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-4 border rounded-xl overflow-hidden shadow-sm">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-10 w-28 mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}