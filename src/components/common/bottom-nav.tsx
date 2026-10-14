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
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background pt-2 pb-[calc(1.25rem+env(safe-area-inset-bottom))] lg:hidden"
      aria-label="Navegação principal"
    >
      {items.map((item, index) => {
        const active = isActive(pathname, item.href);

        if (index === primaryIndex) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5"
              aria-label={item.label}
            >
              <span className="absolute -top-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="mt-6 text-[10px] font-medium text-muted-foreground">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
          >
            <item.icon className={cn("h-5 w-5", active && "scale-110")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
