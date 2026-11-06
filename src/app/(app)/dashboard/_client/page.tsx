import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ClipboardList, Dog, CreditCard } from "lucide-react";
import { auth } from "@/lib/auth";
import { getGreeting } from "@/lib/format";
import { DashboardHero } from "../_components/dashboard-hero";
import { QuickActions, type QuickActionItem } from "../_components/quick-actions";
import { SectionHeader } from "../_components/section-header";
import { DashboardDogs } from "./dashboard-dogs";
import { DashboardRecentWalks } from "./dashboard-recent-walks";
import { DashboardHeroStats } from "./dashboard-hero-stats";
import { DashboardActiveWalk } from "./dashboard-active-walk";

export const metadata: Metadata = { title: "Dashboard | DogTravel" };

const quickActions: QuickActionItem[] = [
  { href: "/walks/new",        icon: Plus,          label: "Solicitar passeio", bg: "bg-primary/10",     fg: "text-primary",                           primary: true },
  { href: "/walks",            icon: ClipboardList, label: "Meus passeios",     bg: "bg-blue-500/10",    fg: "text-blue-600 dark:text-blue-400" },
  { href: "/dogs",             icon: Dog,           label: "Meus cães",         bg: "bg-amber-500/10",   fg: "text-amber-600 dark:text-amber-400" },
  { href: "/profile/payments", icon: CreditCard,    label: "Pagamentos",        bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
];

export default async function ClientDashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Cliente";

  return (
    <div className="space-y-6 pb-8 lg:space-y-7">

      {/* ── Hero ── */}
      <DashboardHero>
        <div className="flex items-center justify-between gap-4 lg:items-end">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary-foreground/65">{getGreeting()}</p>
            <h1 className="mt-0.5 truncate text-2xl font-bold tracking-tight lg:text-3xl">{firstName}!</h1>
            <p className="mt-1 text-sm text-primary-foreground/70 lg:mt-1.5">Pronto para o próximo passeio?</p>
            <Link
              href="/walks/new"
              className="mt-5 hidden items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-white/90 lg:inline-flex"
            >
              <Plus className="h-4 w-4" />
              Solicitar passeio
            </Link>
          </div>
          <DashboardHeroStats />
        </div>
      </DashboardHero>

      {/* ── Active walk banner (API-driven) ── */}
      <DashboardActiveWalk />

      {/* ── Quick actions ── */}
      <QuickActions items={quickActions} />

      {/* ── My dogs ── */}
      <section className="space-y-3.5">
        <SectionHeader title="Meus cães" href="/dogs" linkLabel="Gerenciar" />
        <DashboardDogs />
      </section>

      {/* ── Recent walks (API-driven) ── */}
      <section className="space-y-3.5">
        <SectionHeader title="Últimos passeios" href="/walks" linkLabel="Ver todos" />
        <DashboardRecentWalks />
      </section>

    </div>
  );
}
