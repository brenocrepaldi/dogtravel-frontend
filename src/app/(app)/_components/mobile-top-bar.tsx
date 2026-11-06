"use client";

import Link from "next/link";
import { PawPrint } from "lucide-react";

export function MobileTopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-border bg-background px-4 lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <PawPrint className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-sm font-bold tracking-tight text-foreground">DogTravel</span>
      </Link>
    </header>
  );
}
