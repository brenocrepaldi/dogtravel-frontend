import Link from 'next/link';
import Image from 'next/image';
import { MapPin, MessageSquare, PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { initials } from './walk-detail-helpers';

export function ClientCard({
  walkId,
  clientId,
  clientName,
  clientAvatarUrl,
  petNames,
  address,
  showChat,
}: {
  walkId: string;
  clientId?: string;
  clientName: string;
  clientAvatarUrl?: string | null;
  petNames: string[];
  address: string;
  showChat: boolean;
}) {
  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div className="border-b border-border/60 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-foreground">Cliente</h2>
      </div>
      <CardContent className="p-5 space-y-4">
        <Link href={clientId ? `/clients/${clientId}` : '#'} className="flex items-center gap-3 group">
          {clientAvatarUrl ? (
            <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden ring-1 ring-border/30 group-hover:ring-primary/30 transition-all">
              <Image src={clientAvatarUrl} alt={clientName} fill sizes="56px" className="object-cover" />
            </div>
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all">
              {initials(clientName)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{clientName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {petNames.length} {petNames.length === 1 ? 'cão' : 'cães'} neste passeio
            </p>
          </div>
        </Link>
        <div className="space-y-1.5">
          {petNames.map((name) => (
            <div key={name} className="flex items-center gap-2 text-xs text-muted-foreground">
              <PawPrint className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span className="font-medium text-foreground">{name}</span>
            </div>
          ))}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <MapPin className="mt-px h-3.5 w-3.5 shrink-0" />
            <span className="leading-relaxed">{address}</span>
          </div>
        </div>
        <Separator className="opacity-60" />
        {showChat ? (
          <Link
            href={`/walks/${walkId}/chat`}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full gap-1.5')}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Abrir chat com cliente
          </Link>
        ) : (
          <p className="text-center text-[11px] text-muted-foreground/60">
            Chat disponível apenas durante o passeio
          </p>
        )}
      </CardContent>
    </Card>
  );
}
