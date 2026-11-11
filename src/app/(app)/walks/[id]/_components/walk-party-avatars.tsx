import Image from 'next/image';
import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/format';

type Pet = { name: string; photoUrl?: string | null };

interface WalkPartyAvatarsProps {
  pets: Pet[];
  walkerName?: string | null;
  walkerAvatarUrl?: string | null;
  className?: string;
}

const MAX_PETS = 3;

/**
 * The dogs of a walk side by side with their walker tucked into the corner —
 * the same composition as the live-map marker, sized for a page header.
 */
export function WalkPartyAvatars({ pets, walkerName, walkerAvatarUrl, className }: WalkPartyAvatarsProps) {
  const shown = pets.slice(0, MAX_PETS);
  const hidden = pets.length - shown.length;
  const hasWalker = Boolean(walkerName || walkerAvatarUrl);

  return (
    <div className={cn('relative flex shrink-0 items-center', className)}>
      {shown.map((pet, i) => (
        <div
          key={`${pet.name}-${i}`}
          className={cn(
            'relative h-14 w-14 overflow-hidden rounded-full bg-amber-100 shadow-md ring-[3px] ring-background sm:h-16 sm:w-16',
            i > 0 && '-ml-4',
          )}
          style={{ zIndex: shown.length - i }}
        >
          {pet.photoUrl ? (
            <Image src={pet.photoUrl} alt={pet.name} fill sizes="64px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PawPrint className="h-6 w-6 text-amber-600" />
            </div>
          )}
        </div>
      ))}

      {hidden > 0 && (
        <div className="-ml-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground ring-[3px] ring-background sm:h-16 sm:w-16">
          +{hidden}
        </div>
      )}

      {hasWalker && (
        <div
          className="absolute -bottom-1 -right-1.5 z-10 h-7 w-7 overflow-hidden rounded-full bg-primary shadow-md ring-2 ring-background sm:h-8 sm:w-8"
          title={walkerName ?? 'Passeador'}
        >
          {walkerAvatarUrl ? (
            <Image src={walkerAvatarUrl} alt={walkerName ?? 'Passeador'} fill sizes="32px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-primary-foreground">
              {getInitials(walkerName ?? 'P')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
