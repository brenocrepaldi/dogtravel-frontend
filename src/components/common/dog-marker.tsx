import Image from 'next/image';

type Pet = { name: string; photoUrl?: string | null };

interface DogMarkerProps {
  pets: Pet[];
  walkerAvatarUrl?: string | null;
  size?: 'sm' | 'lg';
}

const SIZE_CLASSES = {
  sm: {
    ping: 'h-14 w-14',
    bubble: 'h-11 w-11',
    bubbleSizes: '44px',
    emoji: 'text-xl',
    avatar: 'h-5 w-5',
    avatarSizes: '20px',
  },
  lg: {
    ping: 'h-16 w-16',
    bubble: 'h-12 w-12',
    bubbleSizes: '48px',
    emoji: 'text-2xl',
    avatar: 'h-6 w-6',
    avatarSizes: '24px',
  },
} as const;

export function DogMarker({ pets, walkerAvatarUrl, size = 'lg' }: DogMarkerProps) {
  const s = SIZE_CLASSES[size];
  const firstPhoto = pets.find((p) => p.photoUrl)?.photoUrl ?? null;
  const count = pets.length;

  return (
    <div className="relative flex items-center justify-center">
      <span className={`absolute ${s.ping} animate-ping rounded-full bg-primary/20`} />
      <div
        className={`relative ${s.bubble} overflow-hidden rounded-full border-[3px] border-white bg-amber-100 shadow-lg`}
      >
        {firstPhoto ? (
          <Image
            src={firstPhoto}
            alt={pets[0]?.name ?? 'Cão'}
            fill
            sizes={s.bubbleSizes}
            className="object-cover"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${s.emoji}`}>🦮</div>
        )}
      </div>
      {/* Walker avatar — overlaid bottom-right of the dog bubble */}
      {walkerAvatarUrl && (
        <div
          className={`absolute -bottom-1 -right-1 ${s.avatar} overflow-hidden rounded-full border-2 border-white shadow-sm`}
        >
          <Image
            src={walkerAvatarUrl}
            alt="Passeador"
            fill
            sizes={s.avatarSizes}
            className="object-cover"
          />
        </div>
      )}
      {count > 1 && !walkerAvatarUrl && (
        <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-primary text-[10px] font-bold text-primary-foreground shadow">
          {count}
        </div>
      )}
    </div>
  );
}
