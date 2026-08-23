'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  MapPin,
  Navigation,
  PawPrint,
  Timer,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useWalkRequestById } from '@/features/walks/hooks/use-walks';
import { useAcceptWalk, useDeclineWalk } from '@/features/walks/hooks/use-walk-actions';
import { useWalkerProfile } from '@/features/walkers/hooks/use-walkers';
import type { WalkRequestDog } from '@/types';

// ─── Dynamic map (no SSR) ──────────────────────────────────────────────────────

const RequestStartMap = dynamic(() => import('./request-start-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center gap-2 bg-muted/30">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Carregando mapa…</span>
    </div>
  ),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toMoney(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

const SIZE_LABEL: Record<string, string> = {
  small: 'Pequeno',
  medium: 'Médio',
  large: 'Grande',
  giant: 'Gigante',
};

const SIZE_COLOR: Record<string, string> = {
  small:  'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  medium: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  large:  'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  giant:  'bg-rose-500/10 text-rose-700 dark:text-rose-400',
};

const GENDER_LABEL: Record<string, string> = { male: 'Macho', female: 'Fêmea' };

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function RequestDetailSkeleton() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-36 rounded-lg bg-muted" />
        <div className="h-8 w-64 rounded-lg bg-muted" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="h-64 rounded-2xl bg-muted" />
          <div className="h-48 rounded-2xl bg-muted" />
        </div>
        <div className="space-y-5">
          <div className="h-52 rounded-2xl bg-muted" />
          <div className="h-48 rounded-2xl bg-muted" />
          <div className="h-32 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ─── DogCard ──────────────────────────────────────────────────────────────────

function DogCard({ dog }: { dog: WalkRequestDog }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/40">
        {dog.photoUrl ? (
          <Image src={dog.photoUrl} alt={dog.name} fill sizes="56px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-amber-500/10">
            <PawPrint className="h-6 w-6 text-amber-500" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-sm text-foreground">{dog.name}</p>
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', SIZE_COLOR[dog.size] ?? 'bg-muted text-muted-foreground')}>
            {SIZE_LABEL[dog.size] ?? dog.size}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {GENDER_LABEL[dog.gender] ?? dog.gender}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{dog.breed} · {dog.age} {dog.age === 1 ? 'ano' : 'anos'}</p>
        {dog.notes && (
          <p className="mt-1.5 text-xs text-muted-foreground/80 leading-relaxed italic">&quot;{dog.notes}&quot;</p>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function RequestDetailClient({ requestId }: { requestId: string }) {
  const { data: session } = useSession();
  const router = useRouter();

  const { data: req, isLoading } = useWalkRequestById(requestId);
  const { data: walkerProfile } = useWalkerProfile();
  const walkerProfileId = walkerProfile?.id ?? '';

  const [walkerPos, setWalkerPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setWalkerPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { /* permission denied or unavailable — map works without walker pin */ },
    );
  }, []);

  const { mutate: acceptWalk, isPending: isAccepting } = useAcceptWalk();
  const { mutate: declineWalk, isPending: isDeclining } = useDeclineWalk();

  if (isLoading) return <RequestDetailSkeleton />;

  if (!req) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <p className="text-sm text-muted-foreground">Pedido não encontrado ou já processado.</p>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Voltar ao dashboard
        </Link>
      </div>
    );
  }

  const hasMap = typeof req.startLat === 'number' && typeof req.startLng === 'number';

  function handleAccept() {
    const walkerName = session?.user?.name ?? 'Passeador';
    const walkRequest = {
      id: req!.id,
      clientId: req!.clientId,
      clientName: req!.clientName,
      clientAvatarUrl: req!.clientAvatarUrl,
      petNames: req!.petNames,
      petIds: req!.petIds,
      petPhotos: req!.dogs.map((d) => ({ id: d.id, photoUrl: d.photoUrl })),
      durationMinutes: req!.durationMinutes,
      price: req!.price,
      scheduledAt: req!.scheduledAt,
      scheduledLabel: req!.scheduledLabel,
      startAddress: req!.startAddress,
      receivedMinutes: req!.receivedMinutes,
    };
    acceptWalk(
      { request: walkRequest, walkerName, walkerId: walkerProfileId },
      {
        onSuccess: () => {
          toast.success('Passeio aceito!', {
            description: `${req!.clientName} foi notificado.`,
            action: { label: 'Ver passeios', onClick: () => router.push('/walks') },
          });
          router.push('/dashboard');
        },
        onError: () => toast.error('Erro ao aceitar o passeio. Tente novamente.'),
      },
    );
  }

  function handleDecline() {
    declineWalk(req!.id, {
      onSuccess: () => {
        toast('Passeio recusado', { description: `Pedido de ${req!.clientName} devolvido para a fila.` });
        router.push('/dashboard');
      },
    });
  }

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 text-muted-foreground hover:text-foreground')}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Pedidos recebidos
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-foreground">
              Passeio com{' '}
              <span className="text-emerald-600 dark:text-emerald-400">
                {req.petNames.length > 1
                  ? `${req.petNames.slice(0, -1).join(', ')} & ${req.petNames[req.petNames.length - 1]}`
                  : req.petNames[0] ?? '…'}
              </span>
            </h1>
            <Badge variant="warning">Pendente</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {req.clientName} · {req.scheduledLabel}
          </p>
        </div>

        {/* Earnings highlight in header */}
        <div className="shrink-0 text-right">
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">
            {toMoney(req.price)}
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">ganho estimado</p>
        </div>
      </div>

      {/* ── Body grid ──────────────────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* LEFT column */}
        <div className="space-y-5 lg:col-span-2">

          {/* Map card */}
          {hasMap && (
            <Card className="overflow-hidden py-0 gap-0">
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Local de partida</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{req.startAddress}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Partida
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    Você
                  </span>
                </div>
              </div>
              <div className="relative h-[300px] sm:h-[340px]">
                {walkerPos && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${walkerPos.lat},${walkerPos.lng}&destination=${req.startLat},${req.startLng}&travelmode=walking`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 z-10"
                  >
                    <Button size="sm" className="gap-1.5 rounded-lg text-xs h-8 bg-white text-foreground border border-border/60 shadow-md hover:bg-muted">
                      <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                      Como chegar
                    </Button>
                  </a>
                )}
                <RequestStartMap
                  lat={req.startLat!}
                  lng={req.startLng!}
                  walkerLat={walkerPos?.lat}
                  walkerLng={walkerPos?.lng}
                  walkerAvatarUrl={walkerProfile?.avatarUrl}
                  walkerName={session?.user?.name ?? undefined}
                />
              </div>
            </Card>
          )}

          {/* Walk info card */}
          <Card className="overflow-hidden py-0 gap-0">
            <div className="border-b border-border/60 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground">Detalhes do passeio</h2>
            </div>
            <CardContent className="divide-y divide-border/60 p-0">
              <InfoRow icon={Calendar} label="Data e horário" value={req.scheduledLabel} />
              <InfoRow icon={Timer} label="Duração" value={`${req.durationMinutes} minutos`} />
              <InfoRow icon={MapPin} label="Local de partida" value={req.startAddress} />
              <InfoRow icon={Clock} label="Pedido recebido" value={
                req.receivedMinutes < 2 ? 'Agora mesmo' : `Há ${req.receivedMinutes} min`
              } />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT column */}
        <div className="space-y-5">

          {/* Client card */}
          <Card className="overflow-hidden py-0 gap-0">
            <div className="border-b border-border/60 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground">Cliente</h2>
            </div>
            <CardContent className="p-5 space-y-4">
              <Link href={`/clients/${req.clientId}`} className="flex items-center gap-3 group">
                {req.clientAvatarUrl ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/30 group-hover:ring-primary/30 transition-all">
                    <Image src={req.clientAvatarUrl} alt={req.clientName} fill sizes="56px" className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all">
                    {initials(req.clientName)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{req.clientName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {req.dogs.length} {req.dogs.length === 1 ? 'cão' : 'cães'} neste passeio
                  </p>
                  {req.clientMemberSince && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      Membro desde {req.clientMemberSince}
                    </p>
                  )}
                </div>
              </Link>
              <Separator className="opacity-60" />
              <Link
                href={`/clients/${req.clientId}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full gap-1.5')}
              >
                <User className="h-3.5 w-3.5" />
                Ver perfil do cliente
              </Link>
            </CardContent>
          </Card>

          {/* Dogs card */}
          <Card className="overflow-hidden py-0 gap-0">
            <div className="border-b border-border/60 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground">Cães</h2>
            </div>
            <CardContent className="p-4 space-y-3">
              {req.dogs.length > 0 ? (
                req.dogs.map((dog) => <DogCard key={dog.id} dog={dog} />)
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {req.petNames.map((name) => (
                    <div key={name} className="flex items-center gap-1.5">
                      <PawPrint className="h-3.5 w-3.5 text-amber-500" />
                      <span className="font-medium text-foreground">{name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Earning preview card */}
          <Card className="overflow-hidden py-0 gap-0">
            <div className="border-b border-border/60 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground">Ganho</h2>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-5 py-4 space-y-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Seu ganho estimado</p>
                <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {toMoney(req.price)}
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <p className="text-[11px] text-muted-foreground">valor bruto do passeio</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/40 px-3.5 py-2.5">
                <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Creditado ao concluir o passeio</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ── Action bar ─────────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 rounded-2xl border border-border/60 bg-card shadow-lg shadow-black/5 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-4">
          <p className="hidden sm:block text-sm text-muted-foreground">
            Responda ao pedido de <span className="font-medium text-foreground">{req.clientName}</span>
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <Button
              variant="outline"
              className="gap-2 rounded-lg border-destructive/30 text-destructive hover:border-destructive hover:bg-destructive/10"
              onClick={handleDecline}
              disabled={isDeclining || isAccepting}
            >
              <XCircle className="h-4 w-4" />
              Recusar
            </Button>
            <Button
              className="gap-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/25 px-6"
              onClick={handleAccept}
              disabled={isAccepting || isDeclining}
            >
              {isAccepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isAccepting ? 'Aceitando…' : 'Aceitar passeio'}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
