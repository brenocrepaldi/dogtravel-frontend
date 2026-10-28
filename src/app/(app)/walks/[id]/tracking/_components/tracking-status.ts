import type { WalkStatus } from '@/types';

// Top-bar label for the tracking screen; only an in-progress walk pulses.
export const TRACKING_STATUS: Record<WalkStatus, { label: string; live: boolean; dotClass: string }> = {
  in_progress: { label: 'Em andamento', live: true, dotClass: 'bg-emerald-500' },
  accepted: { label: 'Aguardando início', live: false, dotClass: 'bg-amber-500' },
  pending: { label: 'Aguardando passeador', live: false, dotClass: 'bg-amber-500' },
  completed: { label: 'Concluído', live: false, dotClass: 'bg-muted-foreground' },
  cancelled: { label: 'Cancelado', live: false, dotClass: 'bg-destructive' },
};
