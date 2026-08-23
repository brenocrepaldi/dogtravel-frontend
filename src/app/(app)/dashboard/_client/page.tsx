import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Plus, ClipboardList, Dog, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { PawPrint } from "lucide-react";
import { DashboardDogs } from "./dashboard-dogs";
import { DashboardRecentWalks } from "./dashboard-recent-walks";
import { DashboardHeroStats } from "./dashboard-hero-stats";
import { DashboardActiveWalk } from "./dashboard-active-walk";

export const metadata: Metadata = { title: "Dashboard | DogTravel" };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

export default async function ClientDashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Cliente";
  const greeting  = getGreeting();

  return (
    <div className="space-y-7 pb-8">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 px-6 py-8 md:px-8 text-primary-foreground">
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-16 right-8 h-72 w-72 rounded-full bg-white/[0.03]" />
        <PawPrint className="pointer-events-none absolute bottom-3 right-5 h-32 w-32 text-white/[0.07]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary-foreground/65">{greeting}</p>
            <h1 className="mt-0.5 text-3xl font-bold tracking-tight">{firstName}!</h1>
            <p className="mt-1.5 text-sm text-primary-foreground/70">Pronto para o próximo passeio?</p>
            <Link
              href="/walks/new"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-white/90"
            >
              <Plus className="h-4 w-4" />
              Solicitar passeio
            </Link>
          </div>
          <DashboardHeroStats />
        </div>
      </div>

      {/* ── Active walk banner (API-driven) ── */}
      <DashboardActiveWalk />

      {/* ── Quick actions ── */}
      <section className="space-y-3.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acesso rápido</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([
            { href: "/walks/new",        icon: Plus,          label: "Solicitar passeio", bg: "bg-primary/10",     fg: "text-primary"                          },
            { href: "/walks",            icon: ClipboardList, label: "Meus passeios",     bg: "bg-blue-500/10",    fg: "text-blue-600 dark:text-blue-400"       },
            { href: "/dogs",             icon: Dog,           label: "Meus cães",         bg: "bg-amber-500/10",   fg: "text-amber-600 dark:text-amber-400"     },
            { href: "/profile/payments", icon: CreditCard,    label: "Pagamentos",        bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
          ] as const).map(({ href, icon: Icon, label, bg, fg }) => (
            <Link key={href} href={href}>
              <div className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-4 text-center transition-all duration-150 hover:border-border hover:bg-accent/40">
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl shrink-0", bg)}>
                  <Icon className={cn("h-5 w-5", fg)} />
                </div>
                <span className="text-xs font-semibold leading-tight text-foreground">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
