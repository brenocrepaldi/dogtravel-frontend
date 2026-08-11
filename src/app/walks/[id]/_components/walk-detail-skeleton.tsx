export function WalkDetailSkeleton() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-36 rounded-lg bg-muted" />
        <div className="h-8 w-56 rounded-lg bg-muted" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="h-64 rounded-2xl bg-muted" />
          <div className="h-48 rounded-2xl bg-muted" />
        </div>
        <div className="space-y-5">
          <div className="h-48 rounded-2xl bg-muted" />
          <div className="h-32 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
