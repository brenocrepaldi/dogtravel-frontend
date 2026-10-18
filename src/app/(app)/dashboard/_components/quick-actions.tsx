import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickActionItem {
  href: string;
  icon: LucideIcon;
  label: string;
  bg: string;
  fg: string;
  primary?: boolean;
}

export function QuickActions({ items }: { items: readonly QuickActionItem[] }) {
  return (
    <section className="lg:space-y-3.5">
      <h2 className="hidden text-sm font-semibold text-foreground lg:block">Acesso rápido</h2>
      <div className="grid grid-cols-4 gap-2 lg:gap-3">
        {items.map(({ href, icon: Icon, label, bg, fg, primary }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center gap-2 rounded-xl py-1 text-center lg:gap-3 lg:border lg:border-border/60 lg:bg-card lg:p-4 lg:transition-all lg:duration-150 lg:hover:border-border lg:hover:bg-accent/40"
          >
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-150 group-active:scale-95 lg:h-11 lg:w-11 lg:rounded-xl",
                primary ? "bg-primary shadow-sm shadow-primary/25 lg:bg-primary/10 lg:shadow-none" : bg,
              )}
            >
              <Icon className={cn("h-5 w-5", primary ? "text-primary-foreground lg:text-primary" : fg)} />
            </div>
            <span className="text-[11px] font-semibold leading-tight text-foreground lg:text-xs">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
