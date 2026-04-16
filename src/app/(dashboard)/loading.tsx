import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="p-6 pt-0">
              <Skeleton className="h-8 w-[60px] mb-2" />
              <Skeleton className="h-4 w-[120px]" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6 flex flex-col space-y-1.5">
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <div className="p-6 pt-0 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
              <Skeleton className="h-8 w-24 hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}