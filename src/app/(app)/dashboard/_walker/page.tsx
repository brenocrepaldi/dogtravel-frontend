"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CheckCircle2, ClipboardList, Clock,
  FileCheck2, Lock, MapPin, PawPrint, Star, Timer, TrendingUp,
  Wallet, User, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatBRL, getGreeting, getInitials } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalkRequests, useWalks } from "@/features/walks/hooks/use-walks";
import { useAcceptWalk, useDeclineWalk } from "@/features/walks/hooks/use-walk-actions";
import { useWalkerStats } from "@/features/stats/hooks/use-stats";
import { useWalkerAvailability, useUpdateWalkerAvailability, useWalkerProfile } from "@/features/walkers/hooks/use-walkers";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import { useProfile } from "@/features/profile/hooks/use-profile";
import type { WalkRequest } from "@/types";
import { DashboardHero } from "../_components/dashboard-hero";
import { QuickActions, type QuickActionItem } from "../_components/quick-actions";
import { ActiveWalkBanner } from "../_components/active-walk-banner";
import { SectionHeader } from "../_components/section-header";

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

export default function WalkerDashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "Passeador";
  const router    = useRouter();

  const { data: walkerRequests = [] } = useWalkRequests();
  const { mutate: acceptWalk, isPending: isAccepting } = useAcceptWalk();
  const { mutate: declineWalk } = useDeclineWalk();

  const { data: walkerProfile } = useWalkerProfile();
  const walkerProfileId = walkerProfile?.id ?? "";

  const { data: allWalks = [], isLoading: walksLoading } = useWalks("walker", session?.user?.id ?? "", {
    enabled: !!session?.user?.id,
  });
  const { data: stats } = useWalkerStats();
  const { data: available = false } = useWalkerAvailability(walkerProfileId);
  const { mutate: updateAvailability, isPending: updatingAvailability } = useUpdateWalkerAvailability(walkerProfileId);

  const { data: documents, isLoading: documentsLoading } = useDocuments();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const hasPhoto           = !!profile?.avatarUrl;
  const identityVerified   = documents?.identity === "verified";
  const backgroundVerified = documents?.background === "verified";
  const isEligibilityLoading = documentsLoading || profileLoading;
  const canToggle          = !isEligibilityLoading && hasPhoto && identityVerified && backgroundVerified;

  if (sessionStatus === "loading") return null;

  const completedWalks = allWalks.filter((w) => w.status === "completed");
  const activeWalk = allWalks.find((w) => w.status === "in_progress");

  function handleAvailabilityClick() {
    if (!hasPhoto) {
      toast.warning("Foto de perfil necessária", {
        description: "Adicione uma foto ao seu perfil antes de ativar sua disponibilidade.",
        action: { label: "Atualizar perfil", onClick: () => router.push("/profile") },
      });
      return;
    }
    if (!canToggle) {
      toast.warning("Verificação de identidade necessária", {
        description: "Complete a verificação antes de ativar sua disponibilidade.",
        action: { label: "Verificar agora", onClick: () => router.push("/profile/documents") },
      });
      return;
    }
    if (!backgroundVerified) {
      toast.warning("Antecedentes criminais necessários", {
        description: "Envie seu comprovante de antecedentes antes de ativar sua disponibilidade.",
        action: { label: "Enviar agora", onClick: () => router.push("/profile/documents") },
      });
      return;
    }
    const next = !available;
    updateAvailability(next, {
      onSuccess: () => {
        if (next) toast.success("Você está disponível para passeios");
        else      toast.warning("Você ficou indisponível");
      },
      onError: () => toast.error("Erro ao atualizar disponibilidade."),
    });
  }

  function handleAccept(request: WalkRequest) {
    const walkerName = session?.user?.name ?? "Passeador";
    acceptWalk(
      { request, walkerName, walkerId: walkerProfileId },
      {
        onSuccess: () => {
          toast.success("Passeio aceito!", {
            description: `${request.clientName} foi notificado. Veja em Meus passeios.`,
            action: { label: "Ver passeios", onClick: () => router.push("/walks") },
          });
        },
        onError: () => {
          toast.error("Erro ao aceitar o passeio.", {
            description: "Tente novamente. Se o problema persistir, recarregue a página.",
          });
        },
      },
    );
  }

  function handleDecline(request: WalkRequest) {
    declineWalk(request.id, {
      onSuccess: () => {
        toast("Passeio recusado", { description: `Pedido de ${request.clientName} devolvido para a fila.` });
      },
    });
  }

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
          <div>
            <p className="text-sm font-medium text-primary-foreground/65">{getGreeting()}</p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight lg:text-3xl">{firstName}!</h1>
            <p className="mt-1 text-sm text-primary-foreground/70 lg:mt-1.5">
              {getHeroSubtitle(canToggle, available, walkerRequests.length)}
            </p>

            {/* Availability toggle */}
            <button
              type="button"
              onClick={handleAvailabilityClick}
              disabled={updatingAvailability}
              className={cn(
                "mt-4 flex w-full cursor-pointer select-none items-center justify-between rounded-xl px-4 py-3 transition-all duration-200 disabled:opacity-70 lg:mt-5 lg:w-52",
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

          {/* Earnings stats (API-driven) */}
          <div className="flex gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 lg:flex-col lg:gap-0">
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

      {/* ── Incoming requests ── */}
      <section className="space-y-3.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Pedidos recebidos</h2>
          {available && walkerRequests.length > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
              {walkerRequests.length}
            </span>
          )}
        </div>

        {/* State 1: offline or profile incomplete */}
        {!available && (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 p-4 lg:flex-col lg:py-10 lg:text-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted lg:h-12 lg:w-12">
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Você está offline</p>
              <p className="mt-0.5 text-xs text-muted-foreground lg:mx-auto lg:max-w-[260px]">
                {!canToggle
                  ? "Conclua seu perfil para poder receber pedidos de passeio."
                  : "Ative sua disponibilidade para começar a receber pedidos."}
              </p>
            </div>
            {canToggle && (
              <button
                type="button"
                onClick={handleAvailabilityClick}
                className="h-11 shrink-0 cursor-pointer rounded-lg border border-primary/20 bg-primary/8 px-4 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 lg:mt-1 lg:h-auto lg:py-1.5"
              >
                <span className="lg:hidden">Ativar</span>
                <span className="hidden lg:inline">Ativar disponibilidade</span>
              </button>
            )}
          </div>
        )}

        {/* State 2: online, no requests yet */}
        {available && walkerRequests.length === 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 lg:flex-col lg:gap-4 lg:py-10 lg:text-center">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center lg:h-12 lg:w-12">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
                <PawPrint className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Você está online</p>
              <p className="mt-0.5 text-xs text-muted-foreground lg:mx-auto lg:max-w-[260px]">
                Aguardando novos pedidos de passeio. Você será notificado assim que chegarem.
              </p>
            </div>
            <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground/70 lg:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Disponível para receber pedidos
            </div>
          </div>
        )}

        {/* State 3: has pending requests */}
        {available && walkerRequests.length > 0 && (
          <div className="space-y-3">
            {walkerRequests.map((req) => (
              <div
                key={req.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/walk-requests/${req.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && router.push(`/walk-requests/${req.id}`)}
                className="relative cursor-pointer overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.05] via-card to-card shadow-sm"
              >
                {/* Left accent bar */}
                <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-emerald-400 to-emerald-600" />

                <div className="px-5 py-4 pl-6">
                  {/* Top row: avatar + name/pets + price */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Client avatar */}
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-emerald-500/20">
                        {req.clientAvatarUrl ? (
                          <Image src={req.clientAvatarUrl} alt={req.clientName} fill sizes="44px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-emerald-500/10 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            {getInitials(req.clientName)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="block truncate text-sm font-semibold text-foreground">
                          {req.clientName}
                        </p>
                        {/* Dog photo bubbles + names */}
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <div className="flex items-center">
                            {req.petPhotos.slice(0, 3).map((pet, i) => (
                              <div
                                key={pet.id}
                                style={{ zIndex: req.petPhotos.length - i, marginLeft: i === 0 ? 0 : '-6px' }}
                                className="relative h-5 w-5 overflow-hidden rounded-full ring-[1.5px] ring-card"
                              >
                                {pet.photoUrl ? (
                                  <Image src={pet.photoUrl} alt="" fill sizes="20px" className="object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-amber-500/15">
                                    <PawPrint className="h-2.5 w-2.5 text-amber-500" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {req.petNames.join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price — main motivator, visually dominant */}
                    <div className="shrink-0 text-right">
                      <p className="text-2xl font-bold leading-none text-emerald-600 dark:text-emerald-400">
                        {formatBRL(req.price)}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-muted-foreground/70">
                        ganho estimado
                      </p>
                    </div>
                  </div>

                  {/* Detail badges */}
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1.5 text-xs text-foreground/70">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {req.scheduledLabel}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1.5 text-xs text-foreground/70">
                      <Timer className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {req.durationMinutes} min
                    </span>
                    <span className="flex items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1.5 text-xs text-foreground/70">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      {req.startAddress}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="mt-4 border-t border-border/40" />

                  {/* Action row: timestamp + buttons */}
                  <div className="mt-3.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      {req.receivedMinutes < 2 ? "Recebido agora" : `Recebido há ${req.receivedMinutes} min`}
                    </span>

                    <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-11 rounded-lg border border-border/60 px-3 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/8 lg:h-8 lg:border-0"
                        onClick={(e) => { e.stopPropagation(); handleDecline(req); }}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1.5" />
                        Recusar
                      </Button>
                      <Button
                        size="sm"
                        className="h-11 rounded-lg px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm shadow-emerald-500/25 lg:h-8"
                        onClick={(e) => { e.stopPropagation(); handleAccept(req); }}
                        disabled={isAccepting}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Aceitar passeio
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Quick actions ── */}
      <QuickActions items={quickActions} />

      {/* ── Stats strip (API-driven) ── */}
      <div className="grid grid-cols-3 divide-x divide-border/50 overflow-hidden rounded-xl border border-border/60 bg-card lg:gap-3 lg:divide-x-0 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent">
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
                {completedWalks.slice(0, 3).map((walk) => (
                  <div
                    key={walk.id}
                    className="group flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-muted/30"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary transition-transform duration-150 group-hover:scale-105">
                      {getInitials(walk.clientName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{walk.clientName}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {walk.petNames.join(" & ")} · {walk.dateLabel}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 sm:inline-flex">
                        Concluído
                      </span>
                      <span className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        +{formatBRL(walk.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      )}

    </div>
  );
}
