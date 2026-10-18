import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 pb-8 lg:space-y-7">
      {/* Hero */}
      <Skeleton className="h-36 rounded-2xl lg:h-44" />

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2 lg:gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 lg:block">
            <Skeleton className="h-12 w-12 rounded-2xl lg:h-24 lg:w-full lg:rounded-xl" />
            <Skeleton className="h-3 w-14 rounded lg:hidden" />
          </div>
        ))}
      </div>

      {/* Carousel / cards row */}
      <div className="space-y-3.5">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="flex gap-3 overflow-hidden lg:grid lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[150px] w-28 shrink-0 rounded-2xl lg:h-20 lg:w-auto lg:rounded-xl" />
          ))}
        </div>
      </div>

      {/* List section */}
      <div className="space-y-3.5">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="space-y-2">
          {[1, 2, 3].map((row) => (
            <Skeleton key={row} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
