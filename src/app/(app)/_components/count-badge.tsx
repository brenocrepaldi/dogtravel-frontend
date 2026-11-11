import { cn } from "@/lib/utils";

/** A small pill with a count ("9+" above nine), e.g. pending requests on a nav item. */
export function CountBadge({
  count,
  label,
  className,
}: {
  count: number;
  /** What the number means, read by screen readers instead of the bare digit. */
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold tabular-nums leading-none text-primary-foreground",
        className,
      )}
    >
      <span aria-hidden="true">{count > 9 ? "9+" : count}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
