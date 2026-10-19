import { MapPin, ShieldCheck, Star } from 'lucide-react';
import { WalkerAvatar } from './walker-avatar';

type WalkerHeroProps = {
  name: string;
  avatarUrl?: string | null;
  description: string;
  rating: number;
  reviews: number;
  location: string;
  verified: boolean;
  availability: import('@/types').AvailabilitySlot[];
  joinedDate?: string;
};

export function WalkerHero({
  name,
  avatarUrl,
  description,
  rating,
  reviews,
  location,
  verified,
  joinedDate,
}: WalkerHeroProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-6">
      {/* Avatar */}
      <WalkerAvatar
        name={name}
        avatarUrl={avatarUrl}
        sizes="80px"
        className="w-20 h-20 rounded-2xl"
        initialsClassName="text-2xl"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{name}</h1>
          {verified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Verificado
              </span>
            </span>
          )}
        </div>

        {joinedDate && (
          <p className="text-xs text-muted-foreground mt-1">Membro desde {joinedDate}</p>
        )}

        <p className="text-sm text-muted-foreground leading-relaxed mt-3">{description}</p>

        <div className="flex items-center gap-4 mt-4 flex-wrap text-sm">
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-xs">({reviews} avaliações)</span>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{location}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
