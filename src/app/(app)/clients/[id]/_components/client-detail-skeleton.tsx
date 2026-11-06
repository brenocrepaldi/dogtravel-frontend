import { Skeleton } from "@/components/ui/skeleton";

export function ClientDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-10 animate-pulse">
      <Skeleton className="h-8 w-24 rounded-lg" />
      <div className="flex flex-col lg:flex-row lg:items-start gap-8">
        <div className="flex flex-1 flex-col gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="w-full lg:w-72">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
