import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { WalkTimelineEvent } from '@/types';

export function TimelineCard({
  timeline,
  isLive = false,
}: {
  timeline: WalkTimelineEvent[];
  isLive?: boolean;
}) {
  return (
    <Card className={cn('overflow-hidden py-0 gap-0', isLive && 'ring-1 ring-emerald-500/25')}>
      {isLive && (
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />
      )}
      <div className="border-b border-border/60 px-5 py-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Linha do tempo</h2>
        {isLive && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Ao vivo
          </span>
        )}
      </div>
      <CardContent className="px-5 py-5">
        {timeline.map((event, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'relative z-10 mt-0.5 h-3 w-3 shrink-0 rounded-full ring-2 ring-background',
                  event.state === 'done' && 'bg-emerald-500',
                  event.state === 'current' && 'bg-primary',
                  event.state === 'pending' && 'bg-muted-foreground/25',
                )}
              >
                {event.state === 'current' && (
                  <span className="absolute inset-0 -m-0.5 animate-ping rounded-full bg-primary/40" />
                )}
              </div>
              {i < timeline.length - 1 && (
                <div
                  className={cn(
                    'mt-1.5 min-h-[2rem] w-px flex-1',
                    event.state === 'done' ? 'bg-emerald-500/30' : 'bg-border/50',
                  )}
                />
              )}
            </div>
            <div className={cn('flex-1', i < timeline.length - 1 ? 'pb-5' : 'pb-0')}>
              <div className="flex items-start justify-between gap-3">
                <p
                  className={cn(
                    'text-sm font-medium',
                    event.state === 'pending' ? 'text-muted-foreground/60' : 'text-foreground',
                  )}
                >
                  {event.label}
                </p>
                <span
                  className={cn(
                    'shrink-0 text-xs',
                    event.state === 'pending' ? 'text-muted-foreground/40' : 'text-muted-foreground',
                  )}
                >
                  {event.at}
                </span>
              </div>
              {event.note && <p className="mt-0.5 text-xs text-muted-foreground">{event.note}</p>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
