import Link from 'next/link';
import Image from 'next/image';
import { BadgeCheck, CheckCircle2, ShieldCheck, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { WalkerProfile } from '@/types';
import { initials } from './walk-detail-helpers';

export function WalkerCard({
  walker,
  compact = false,
}: {
  walker: WalkerProfile;
  compact?: boolean;
}) {
  const size = compact ? 'h-12 w-12' : 'h-14 w-14';
  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div className="border-b border-border/60 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">Passeador</h2>
      </div>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          {walker.avatarUrl ? (
            <div className={cn('relative shrink-0 rounded-xl overflow-hidden', size)}>
              <Image src={walker.avatarUrl} alt={walker.name} fill sizes="56px" className="object-cover" />
            </div>
          ) : (
            <div
              className={cn(
                'flex shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary',
                size,
              )}
            >
              {initials(walker.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-semibold text-foreground">{walker.name}</p>
              {walker.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3 w-3',
                      i < Math.round(walker.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted-foreground/30',
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {walker.rating.toFixed(1)} · {walker.reviews} aval.
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          {walker.trustChecks.identityVerified && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              Identidade verificada
            </div>
          )}
          {walker.trustChecks.backgroundCheck && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              Antecedentes verificados
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
            {walker.completedWalks} passeios concluídos
          </div>
        </div>
        <Separator className="opacity-60" />
        <Link
          href={`/walkers/${walker.id}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}
        >
          Ver perfil completo
        </Link>
      </CardContent>
    </Card>
  );
}
