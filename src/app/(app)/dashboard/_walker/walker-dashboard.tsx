"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ChevronRight, ClipboardList, FileCheck2, Lock, Star, TrendingUp, Wallet, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL, getGreeting } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalkRequests, useWalks } from "@/features/walks/hooks/use-walks";
import { useWalkerStats } from "@/features/stats/hooks/use-stats";
import { useAvailabilityToggle } from "@/features/walkers/hooks/use-availability-toggle";
import DashboardLoading from "../loading";
import { DashboardHero } from "../_components/dashboard-hero";
import { QuickActions, type QuickActionItem } from "../_components/quick-actions";
import { ActiveWalkBanner } from "../_components/active-walk-banner";
import { SectionHeader } from "../_components/section-header";
import { HeroReputation } from "../_components/hero-reputation";
import { WalkListAvatar } from "@/components/common/walk-list-avatar";
import { AvailabilityCard } from "./availability-card";
import { NextWalkCard, findNextWalk } from "./next-walk-card";

const quickActions: QuickActionItem[] = [
  { href: "/walks",             icon: ClipboardList, label: "Meus passeios", bg: "bg-primary/10",     fg: "text-primary" },
  { href: "/profile/payments",  icon: Wallet,        label: "Ganhos",        bg: "bg-emerald-500/10", fg: "text-emerald-600 dark:text-emerald-400" },
  { href: "/profile/documents", icon: FileCheck2,    label: "Documentos",    bg: "bg-blue-500/10",    fg: "text-blue-600 dark:text-blue-400" },
  { href: "/profile",           icon: User,          label: "Meu perfil",    bg: "bg-amber-500/10",   fg: "text-amber-600 dark:text-amber-400" },
];

function getHeroSubtitle(canToggle: boolean, available: boolean, requestCount: number): string {
  if (!canToggle) return "Conclua seu perfil para ativar sua disponibilidade.";
  if (!available) return "Ative sua disponibilidade para receber pedidos.";
  if (requestCount > 0) return `${requestCount} pedido${requestCount > 1 ? "s" : ""} aguardando sua resposta.`;
  return "Você está online. Aguardando novos pedidos.";
}

export default function WalkerDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Passeador";

  const { data: walkerRequests = [] } = useWalkRequests();
  const {
    available,
    canToggle,
    toggle: handleAvailabilityClick,
    isLoading: availabilityLoading,
    isUpdating: updatingAvailability,
  } = useAvailabilityToggle();

  const { data: allWalks = [], isLoading: walksLoading } = useWalks("walker", session?.user?.id ?? "", {
    enabled: !!session?.user?.id,
  });
  const { data: stats } = useWalkerStats();

  if (sessionStatus === "loading") return <DashboardLoading />;

  const completedWalks = allWalks.filter((w) => w.status === "completed");
  const activeWalk = allWalks.find((w) => w.status === "in_progress");

  const statItems = [
    {
      label: "passeios totais",
      value: stats ? String(stats.totalWalks) : "—",
      href: "/walks", icon: ClipboardList,
      color: "text-primary", bg: "bg-primary/10",
    },
    {
      label: "passeios este mês",
      value: stats ? String(stats.walksThisMonth) : "—",
      href: "/walks", icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10",
    },
    {
      label: `${stats?.totalReviews ?? "—"} avaliações`,
      value: stats ? `${stats.rating.toFixed(1)} ★` : "—",
      href: "/profile", icon: Star,
      color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10",
    },
  ] as const;

  return (
    <div className="space-y-6 pb-8 lg:space-y-7">

      {/* ── Hero ── */}
      <DashboardHero className={cn("transition-all duration-500", available && canToggle && "to-emerald-700/60")}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="max-md:flex max-md:items-center max-md:justify-between max-md:gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary-foreground/65">{getGreeting()}</p>
              <h1 className="mt-0.5 text-2xl font-bold tracking-tight lg:text-3xl">{firstName}!</h1>
              {/* Phones: status and requests live in AvailabilityCard, the hero just greets. */}
              {/* Phones: the walker's reputation at a glance, in place of the stats strip. */}
              <HeroReputation
                rating={stats?.rating}
                totalWalks={stats?.totalWalks}
                className="mt-1.5 md:hidden"
              />
              {available && canToggle && walkerRequests.length > 0 ? (
                <Link
                  href="/walk-requests"
                  className="max-md:hidden mt-1 inline-flex min-h-6 items-center gap-1 text-sm font-medium text-primary-foreground underline-offset-4 hover:underline lg:mt-1.5"
                >
                  {getHeroSubtitle(canToggle, available, walkerRequests.length)}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <p className="max-md:hidden mt-1 text-sm text-primary-foreground/70 lg:mt-1.5">
                  {getHeroSubtitle(canToggle, available, walkerRequests.length)}
                </p>
              )}

              {/* Availability toggle (md+; phones use AvailabilityCard below the hero) */}
              <button
                type="button"
                onClick={handleAvailabilityClick}
                disabled={updatingAvailability}
                className={cn(
                  "max-md:hidden mt-4 flex w-full cursor-pointer select-none items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 disabled:opacity-70 lg:mt-5 lg:w-52",
                  available && canToggle
                    ? "bg-emerald-500/20 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-white/10 hover:bg-white/[0.15]",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    {available && canToggle && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span className={cn(
                      "relative inline-flex h-2.5 w-2.5 rounded-full transition-colors duration-300",
                      available && canToggle ? "bg-emerald-400" : "bg-white/30",
                    )} />
                  </span>
                  <div className="text-left">
                    <p className="text-[11px] font-medium text-primary-foreground/60">
                      {!canToggle ? "Disponibilidade" : "Status"}
                    </p>
                    <p className="text-sm font-semibold leading-tight text-primary-foreground">
                      {!canToggle ? "Bloqueada" : available ? "Disponível" : "Indisponível"}
                    </p>
                  </div>
                </div>

                {!canToggle ? (
                  <Lock className="h-4 w-4 shrink-0 text-white/40" />
                ) : (
                  <div className={cn(
                    "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300",
                    available ? "bg-emerald-400" : "bg-white/25",
                  )}>
                    <span className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300",
                      available ? "left-[calc(100%-1.125rem)]" : "left-0.5",
                    )} />
                  </div>
                )}
              </button>
            </div>

            {/* Earnings, compact like the client's hero stats (phones only) */}
            <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/10 md:hidden">
              <div className="px-3.5 py-2 text-right">
                <p className="text-lg font-bold leading-none tabular-nums text-emerald-300">
                  {stats ? formatBRL(stats.earningsToday) : "—"}
                </p>
                <p className="mt-0.5 text-xs text-primary-foreground/60">hoje</p>
              </div>
              <div className="h-px bg-white/10" />
              <div className="px-3.5 py-2 text-right">
                <p className="text-lg font-bold leading-none tabular-nums">
                  {stats ? formatBRL(stats.earningsMonth) : "—"}
                </p>
                <p className="mt-0.5 text-xs text-primary-foreground/60">este mês</p>
              </div>
            </div>
          </div>

          {/* Earnings stats (API-driven) */}
          <div className="max-md:hidden flex gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 lg:flex-col lg:gap-0">
            <div className="flex-1 px-4 py-2.5 text-center lg:px-5 lg:py-3 lg:text-right">
              <p className="text-xl font-bold leading-none text-emerald-300 lg:text-2xl">
                {stats ? formatBRL(stats.earningsToday) : "—"}
              </p>
              <p className="mt-0.5 text-xs text-primary-foreground/60">hoje</p>
            </div>
            <div className="w-px bg-white/10 lg:h-px lg:w-auto" />
            <div className="flex-1 px-4 py-2.5 text-center lg:px-5 lg:py-3 lg:text-right">
              <p className="text-xl font-bold leading-none lg:text-2xl">
                {stats ? formatBRL(stats.earningsMonth) : "—"}
              </p>
              <p className="mt-0.5 text-xs text-primary-foreground/60">este mês</p>
            </div>
          </div>
        </div>
      </DashboardHero>

      {/* ── Active walk banner (API-driven) ── */}
      <ActiveWalkBanner walk={activeWalk} />

      {/* ── Quick actions ── */}
      <QuickActions items={quickActions} />

      {/* ── Availability (phones; md+ keeps the toggle in the hero) ── */}
      <AvailabilityCard
        className="md:hidden"
        available={available}
        canToggle={canToggle}
        isLoading={availabilityLoading}
        isUpdating={updatingAvailability}
        requestCount={walkerRequests.length}
        onToggle={handleAvailabilityClick}
      />

      {/* ── Next scheduled walk (phones) ── */}
      <section className="space-y-3.5 md:hidden">
        <SectionHeader title="Próximo passeio" href="/walks" linkLabel="Ver agenda" />
        <NextWalkCard walk={findNextWalk(allWalks, new Date())} isLoading={walksLoading} />
      </section>

      {/* ── Stats strip (md+; phones show rating and total in the hero) ── */}
      <div className="max-md:hidden grid grid-cols-3 divide-x divide-border/50 overflow-hidden rounded-xl border border-border/60 bg-card lg:gap-3 lg:divide-x-0 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent">
        {statItems.map(({ label, value, href, icon: Icon, color, bg }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col items-center gap-1 px-2 py-3.5 text-center transition-colors hover:bg-accent/40 lg:items-start lg:gap-3 lg:rounded-xl lg:border lg:border-border/60 lg:bg-card lg:p-4 lg:text-left lg:transition-all lg:duration-150 lg:hover:border-border"
          >
            <div className={cn("hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl lg:flex", bg)}>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-foreground lg:text-xl">{value}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground lg:text-xs">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Recent completed walks — only shown when there is history ── */}
      {(walksLoading || completedWalks.length > 0) && (
        <section className="space-y-3.5">
          <SectionHeader title="Últimos passeios" href="/walks" linkLabel="Ver todos" />
          <Card className="overflow-hidden py-0 gap-0">
            {walksLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {completedWalks.slice(0, 3).map((walk) => {
                  const pets = walk.pets?.length ? walk.pets : [{ name: walk.petNames[0] ?? "Cão", photoUrl: null }];
                  return (
                    <Link key={walk.id} href={`/walks/${walk.id}`}>
                      <div className="group flex items-center gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-muted/30 sm:gap-4 sm:px-5 sm:py-4">
                        <WalkListAvatar
                          main={pets.map((pet) => ({ ...pet, kind: "dog" as const }))}
                          corner={{ name: walk.clientName, photoUrl: walk.clientAvatarUrl, kind: "person" }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{walk.petNames.join(" & ")}</p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {walk.clientName} · {walk.dateLabel}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                          <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                            +{formatBRL(walk.price)}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 sm:order-first sm:px-2.5 sm:text-[11px] dark:text-emerald-400">
                            Concluído
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </section>
      )}

    </div>
  );
}
