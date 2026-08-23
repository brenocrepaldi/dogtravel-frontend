"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarDays,
  Heart,
  PawPrint,
  Star,
  Trophy,
  User,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useClientProfile } from "@/features/clients/hooks/use-clients";
import type { ClientProfile } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZE_LABEL: Record<string, string> = {
  small: "Porte Pequeno",
  medium: "Porte Médio",
  large: "Porte Grande",
  giant: "Porte Gigante",
};

const SIZE_COLOR: Record<string, string> = {
  small:  "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  medium: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  large:  "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  giant:  "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

const GENDER_LABEL: Record<string, string> = { male: "Macho", female: "Fêmea" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CLIENT_GRADIENTS = [
  "from-violet-400/30 to-purple-500/30",
  "from-sky-400/30 to-blue-500/30",
  "from-emerald-400/30 to-teal-500/30",
  "from-rose-400/30 to-pink-500/30",
  "from-amber-400/30 to-orange-500/30",
  "from-indigo-400/30 to-violet-500/30",
];

function clientGradient(name: string) {
  return CLIENT_GRADIENTS[name.charCodeAt(0) % CLIENT_GRADIENTS.length];
}

function clientInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function memberSinceLabel(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex flex-col gap-1.5 rounded-xl border border-border/50 bg-card px-4 py-3.5",
      className,
    )}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
      </div>
      <p className="text-sm font-semibold text-foreground leading-snug">{value}</p>
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  title,
  description,
}: {
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  title: string;
  description: string;
}) {
  return (
    <CardHeader className="pt-5">
      <div className="flex items-center gap-2.5">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={cn("w-4 h-4", iconColor)} />
        </div>
        <div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function ClientAvatar({
  name,
  avatarUrl,
  size = "lg",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "lg";
}) {
  const sizeCls = size === "lg"
    ? "w-20 h-20 text-2xl rounded-2xl ring-2 ring-border/30"
    : "w-10 h-10 text-sm rounded-xl ring-2 ring-border/30";

  if (avatarUrl) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden", sizeCls)}>
        <Image src={avatarUrl} alt={name} fill sizes="80px" className="object-cover" />
      </div>
    );
  }
  return (
    <div className={cn(
      "shrink-0 bg-gradient-to-br flex items-center justify-center font-bold text-foreground/70",
      clientGradient(name),
      sizeCls,
    )}>
      {clientInitials(name)}
    </div>
  );
}

// ─── Dog card ─────────────────────────────────────────────────────────────────

function DogCard({ dog }: { dog: ClientProfile["dogs"][number] }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-all duration-200 hover:border-border hover:shadow-sm">
      {/* Square avatar */}
      <div className="relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-amber-500/8">
        {dog.photoUrl ? (
          <Image
            src={dog.photoUrl}
            alt={dog.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PawPrint className="h-7 w-7 text-amber-400/70" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="truncate text-sm font-semibold text-foreground">{dog.name}</p>
        <p className="truncate text-xs text-muted-foreground">{dog.breed}</p>
        <div className="flex flex-wrap gap-1">
          <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold", SIZE_COLOR[dog.size] ?? "bg-muted text-muted-foreground")}>
            {SIZE_LABEL[dog.size] ?? dog.size}
          </span>
          <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {GENDER_LABEL[dog.gender] ?? dog.gender}
          </span>
          <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {dog.age} {dog.age === 1 ? "ano" : "anos"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Review card ──────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ClientProfile["reviews"][number] }) {
  const date = new Date(review.createdAt).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={cn(
      "rounded-xl border border-border/60 bg-card p-4",
      "transition-all duration-300 hover:border-border hover:shadow-sm",
    )}>
      <div className="flex items-start gap-3">
        {review.walkerAvatarUrl ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/40">
            <Image src={review.walkerAvatarUrl} alt={review.walkerName} fill sizes="40px" className="object-cover" />
          </div>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
            {clientInitials(review.walkerName || "?")}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-foreground leading-none">{review.walkerName}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Passeador avaliado</p>
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground">{date}</span>
          </div>

          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i < review.rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted-foreground/30",
                )}
              />
            ))}
            <span className="ml-1.5 text-xs font-semibold text-foreground">{review.rating.toFixed(1)}</span>
          </div>

          {review.comment && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed border-l-2 border-border/60 pl-3 italic">
              &ldquo;{review.comment}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ClientDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-10 animate-pulse">
      <Skeleton className="h-8 w-24 rounded-lg" />
      <div className="flex flex-col lg:flex-row lg:items-start gap-8">
        <div className="flex flex-1 flex-col gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="w-full lg:w-72">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: client, isLoading, isError } = useClientProfile(id);

  if (isLoading) return <ClientDetailSkeleton />;

  if (isError || !client) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Cliente não encontrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Este perfil pode não existir ou ter sido removido.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  const joinedLabel = memberSinceLabel(client.memberSince);

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* ── Back ── */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="-ml-2 self-start text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Voltar
      </Button>

      {/* ── Two-column layout ── */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10">

        {/* ── Main content ── */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">

          {/* Hero */}
          <Card className="overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <ClientAvatar name={client.name} avatarUrl={client.avatarUrl} size="lg" />
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {client.name}
                  </h1>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Membro desde {joinedLabel}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{client.totalWalks}</span>
                      <span className="text-muted-foreground text-xs">
                        {client.totalWalks === 1 ? "passeio concluído" : "passeios concluídos"}
                      </span>
                    </span>
                    {client.avgRatingGiven > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-foreground">
                          {client.avgRatingGiven.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          média nas avaliações
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard icon={Trophy} label="Passeios concluídos" value={`${client.totalWalks}`} />
            <StatCard icon={PawPrint} label="Cães cadastrados" value={`${client.totalDogs}`} />
            <StatCard
              icon={Star}
              label="Média nas avaliações"
              value={client.avgRatingGiven > 0 ? `${client.avgRatingGiven.toFixed(1)} / 5.0` : "Sem avaliações"}
              className="col-span-2 sm:col-span-1"
            />
          </div>

          {/* Dogs */}
          {client.dogs.length > 0 && (
            <Card className="overflow-hidden pt-1">
              <SectionHeader
                icon={PawPrint}
                iconBg="bg-amber-500/10"
                iconColor="text-amber-600 dark:text-amber-400"
                title="Cães"
                description={`${client.dogs.length} ${client.dogs.length === 1 ? "cão cadastrado nesta conta" : "cães cadastrados nesta conta"}`}
              />
              <Separator />
              <CardContent className="p-5">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {client.dogs.map((dog) => (
                    <DogCard key={dog.id} dog={dog} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews given */}
          <Card className="overflow-hidden pt-1">
            <SectionHeader
              icon={Star}
              iconBg="bg-amber-500/10"
              iconColor="text-amber-500"
              title="Avaliações dadas"
              description={
                client.reviews.length > 0
                  ? `${client.reviews.length} avaliação${client.reviews.length > 1 ? "ões" : ""} · média ${client.avgRatingGiven.toFixed(1)}`
                  : "Nenhuma avaliação enviada ainda"
              }
            />
            <Separator />
            <CardContent className="p-5">
              {client.reviews.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <MessageCircle className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Nenhuma avaliação ainda</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      As avaliações aparecerão aqui após passeios concluídos
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {client.reviews.map((review) => (
                    <ReviewCard key={review.walkId} review={review} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom note */}
          <div className="rounded-2xl border border-primary/15 bg-primary/5 px-5 py-5 sm:px-6 flex items-start gap-4">
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Cuide bem dos pets deste cliente</p>
              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                Mantenha o cliente informado durante o passeio e garanta a segurança e bem-estar de cada cão.
              </p>
            </div>
          </div>

        </div>

        {/* ── Sidebar ── */}
        <aside className="w-full shrink-0 lg:w-72 lg:sticky lg:top-8 lg:self-start space-y-4">

          {/* Dog care notes */}
          <Card className="overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-amber-400/60 via-amber-500 to-amber-400/40" />
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 shrink-0">
                  <PawPrint className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Observações dos cães</p>
                  <p className="text-[11px] text-muted-foreground">Informações importantes para o passeio</p>
                </div>
              </div>

              {client.dogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">Nenhum cão cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {client.dogs.map((dog) => (
                    <div key={dog.id} className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                          {dog.photoUrl ? (
                            <Image src={dog.photoUrl} alt={dog.name} fill sizes="32px" className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-amber-500/10">
                              <PawPrint className="h-3.5 w-3.5 text-amber-500" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{dog.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{dog.breed} · {GENDER_LABEL[dog.gender] ?? dog.gender}</p>
                        </div>
                      </div>
                      {dog.notes ? (
                        <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-amber-400/50 pl-2.5 italic">
                          {dog.notes}
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground/60 italic">Sem observações especiais</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating distribution */}
          {client.reviews.length > 0 && (
            <Card className="overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
              <CardContent className="p-5 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Perfil de avaliador</p>
                    <p className="text-[11px] text-muted-foreground">Como este cliente avalia passeadores</p>
                  </div>
                </div>

                {/* Average prominent */}
                <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
                  <span className="text-3xl font-bold text-primary">{client.avgRatingGiven.toFixed(1)}</span>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn("h-3.5 w-3.5", i < Math.round(client.avgRatingGiven) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30")} />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{client.reviews.length} avaliação{client.reviews.length > 1 ? "ões" : ""}</p>
                  </div>
                </div>

                {/* Star breakdown */}
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = client.reviews.filter((r) => r.rating === star).length;
                    const pct = client.reviews.length > 0 ? (count / client.reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground w-6 shrink-0">
                          {star}<Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                        </span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground w-4 text-right shrink-0">{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Tendência */}
                <div className={cn(
                  "rounded-lg border px-3 py-2.5",
                  client.avgRatingGiven >= 4.5
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : client.avgRatingGiven >= 3.5
                    ? "border-amber-500/20 bg-amber-500/5"
                    : "border-rose-500/20 bg-rose-500/5",
                )}>
                  <p className={cn("text-xs font-semibold",
                    client.avgRatingGiven >= 4.5 ? "text-emerald-700 dark:text-emerald-400"
                    : client.avgRatingGiven >= 3.5 ? "text-amber-700 dark:text-amber-400"
                    : "text-rose-700 dark:text-rose-400"
                  )}>
                    {client.avgRatingGiven >= 4.5
                      ? "Avaliador generoso"
                      : client.avgRatingGiven >= 3.5
                      ? "Avaliador equilibrado"
                      : "Avaliador criterioso"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {client.avgRatingGiven >= 4.5
                      ? "Tende a valorizar bem o serviço prestado"
                      : client.avgRatingGiven >= 3.5
                      ? "Avalia com base no desempenho real"
                      : "Espera um alto nível de serviço"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Back link */}
          <button
            onClick={() => router.back()}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>

        </aside>

      </div>
    </div>
  );
}
