import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[250px] mx-auto" />
        </div>
        
        <div className="space-y-4 mt-8">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full mt-6" />
        </div>
        
        <div className="relative mt-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    </div>
  );
}