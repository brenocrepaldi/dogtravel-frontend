"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bell,
  CalendarClock,
  CreditCard,
  Navigation,
  ClipboardList,
  Dog,
  LayoutDashboard,
  Plus,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePendingRequestCount } from "@/features/walks/hooks/use-pending-request-count";
import { useWalks } from "@/features/walks/hooks/use-walks";
import { walkerCenterAction } from "@/lib/walker-center-action";
import { CountBadge } from "./count-badge";

const clientBottomNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { href: "/walks", icon: ClipboardList, label: "Passeios" },
  { href: "/walks/new", icon: Plus, label: "Solicitar" },
  { href: "/dogs", icon: Dog, label: "Meus cães" },
  { href: "/profile", icon: User, label: "Perfil" },
] as const;

const walkerBottomNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { href: "/walks", icon: ClipboardList, label: "Passeios" },
  { href: "/walk-requests", icon: Bell, label: "Pedidos" },
  { href: "/profile/payments", icon: CreditCard, label: "Ganhos" },
  { href: "/profile", icon: User, label: "Perfil" },
] as const;

function matches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

// Only the most specific matching item is active, so /walks/new lights up
// "Solicitar" and not "Passeios" too (same for /profile/payments vs /profile).
const centerIcons = { live: Navigation, today: CalendarClock, requests: Bell } as const;

function activeHref(pathname: string, items: readonly { href: string }[]) {
  return items
    .filter((item) => matches(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role ?? "client";
  const isWalker = role === "walker";
  const pendingRequests = usePendingRequestCount();
  const { data: walkerWalks = [] } = useWalks("walker", session?.user?.id ?? "", {
    enabled: isWalker && !!session?.user?.id,
  });

  // The walker's center button follows their moment: live walk, today's walk, or requests.
  const center = isWalker ? walkerCenterAction(walkerWalks, new Date()) : null;
  const items = isWalker
    ? walkerBottomNav.map((item, i) =>
        i === 2 && center ? { href: center.href, icon: centerIcons[center.kind], label: center.label } : item,
      )
    : clientBottomNav;
  const primaryIndex = 2;
  const current = activeHref(pathname, items);

  return (
    <nav
      className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex items-center gap-1 rounded-full bg-background/75 p-1 shadow-lg shadow-black/10 ring-1 ring-border/60 backdrop-blur-xl backdrop-saturate-150 lg:hidden"
      aria-label="Navegação principal"
    >
      {items.map((item, index) => {
        if (index === primaryIndex) {
          return <span key={item.href} aria-hidden="true" className="w-12" />;
        }

        const active = item.href === current;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 items-center justify-center"
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
          >
            <span
              className={cn(
                "flex w-full flex-col items-center gap-0.5 whitespace-nowrap rounded-2xl px-3 py-1.5 text-[10px] font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "scale-110")} />
              {item.label}
            </span>
          </Link>
        );
      })}

      {(() => {
        const primary = items[primaryIndex];
        const active = primary.href === current;
        const badge = primary.href === "/walk-requests" ? pendingRequests : 0;
        const live = center?.kind === "live";

        return (
          <Link
            href={primary.href}
            aria-label={primary.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "absolute -top-3 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full text-primary-foreground shadow-sm transition-colors",
              live
                ? cn("shadow-emerald-600/30", active ? "bg-emerald-700" : "bg-emerald-600")
                : cn("shadow-primary/30", active ? "bg-[oklch(0.45_0.22_262)]" : "bg-primary"),
            )}
          >
            {live && (
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/40 motion-reduce:hidden" />
            )}
            <primary.icon className="relative h-5 w-5" />
            {badge > 0 && (
              <CountBadge
                count={badge}
                label={`${badge} pedido${badge > 1 ? "s" : ""} pendente${badge > 1 ? "s" : ""}`}
                className="absolute -right-1 -top-1 bg-red-500 text-white ring-2 ring-background"
              />
            )}
          </Link>
        );
      })()}
    </nav>
  );
}
