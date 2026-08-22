"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { PawPrint } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { SidebarNavLinks, WalkerOnboarding, clientNav, walkerNav } from "./sidebar";

export function MobileTopBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role ?? "client";
  const navItems = role === "walker" ? walkerNav : clientNav;

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <PawPrint className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-sm font-bold tracking-tight text-foreground">DogTravel</span>
      </Link>
      <MobileNav>
        <SidebarNavLinks navItems={navItems} pathname={pathname} />
        {role === "walker" && <WalkerOnboarding />}
      </MobileNav>
    </header>
  );
}
