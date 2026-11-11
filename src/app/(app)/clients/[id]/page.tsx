"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  PawPrint,
  Star,
  Trophy,
  User,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useClientProfile } from "@/features/clients/hooks/use-clients";
import { ClientAvatar } from "./_components/client-avatar";
import { ClientDetailSkeleton } from "./_components/client-detail-skeleton";
import { memberSinceLabel } from "./_components/client-detail-helpers";
import { SectionHeader, StatCard } from "./_components/client-detail-primitives";
import { ClientDogNotesCard } from "./_components/client-dog-notes-card";
import { ClientRatingProfileCard } from "./_components/client-rating-profile-card";
import { DogCard } from "./_components/dog-card";
import { ReviewCard } from "./_components/review-card";

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

          <ClientDogNotesCard client={client} />

          {client.reviews.length > 0 && <ClientRatingProfileCard client={client} />}

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
