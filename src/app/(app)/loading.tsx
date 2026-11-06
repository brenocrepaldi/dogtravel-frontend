import { Skeleton } from "@/components/ui/skeleton";

/**
 * Fallback content-area skeleton for any section under this group that
 * doesn't define its own more specific loading.tsx. Sections that benefit
 * from a closer match to their real layout (e.g. dashboard/loading.tsx) can
 * override this by adding their own loading.tsx — Next.js picks the nearest
 * one automatically.
 */
export default function AppLoading() {
  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((row) => (
          <Skeleton key={row} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
