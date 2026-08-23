import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-7 pb-8">
      {/* Hero */}
      <Skeleton className="h-44 rounded-2xl sm:h-36" />

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* List sections */}
      {[1, 2].map((section) => (
        <div key={section} className="space-y-3.5">
          <Skeleton className="h-4 w-32 rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((row) => (
              <Skeleton key={row} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
