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
      className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 flex items-center rounded-full bg-background/75 shadow-lg shadow-black/10 ring-1 ring-border/60 backdrop-blur-xl backdrop-saturate-150 lg:hidden"
      aria-label="Navegação principal"
    >
      {items.map((item, index) => {
        const active = isActive(pathname, item.href);
        const isPrimary = index === primaryIndex;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center justify-center py-2"
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
          >
            <span
              className={cn(
                "flex flex-col items-center gap-1 whitespace-nowrap rounded-2xl px-3 py-2 text-[10px] font-medium transition-colors",
                isPrimary
                  ? "rounded-full bg-primary px-5 text-primary-foreground shadow-sm shadow-primary/30"
                  : active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5", !isPrimary && active && "scale-110")} />
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
