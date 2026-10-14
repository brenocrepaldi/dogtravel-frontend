"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bell,
  CreditCard,
  ClipboardList,
  Dog,
  LayoutDashboard,
  PawPrint,
  Plus,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const clientBottomNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { href: "/walkers", icon: PawPrint, label: "Passeadores" },
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

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role ?? "client";
  const items = role === "walker" ? walkerBottomNav : clientBottomNav;
  const primaryIndex = 2;

  return (
    <nav
      className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex items-center gap-1 rounded-full bg-background/75 p-1.5 shadow-lg shadow-black/10 ring-1 ring-border/60 backdrop-blur-xl backdrop-saturate-150 lg:hidden"
      aria-label="Navegação principal"
    >
      {items.map((item, index) => {
        if (index === primaryIndex) {
          return <span key={item.href} aria-hidden="true" className="w-12" />;
        }

        const active = isActive(pathname, item.href);

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
                "flex flex-col items-center gap-0.5 whitespace-nowrap rounded-2xl px-3 py-1.5 text-[10px] font-medium transition-colors",
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
        const active = isActive(pathname, primary.href);

        return (
          <Link
            href={primary.href}
            aria-label={primary.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "absolute -top-3 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full text-primary-foreground shadow-sm shadow-primary/30 transition-colors",
              active ? "bg-[oklch(0.45_0.22_262)]" : "bg-primary",
            )}
          >
            <primary.icon className="h-5 w-5" />
          </Link>
        );
      })()}
    </nav>
  );
}
