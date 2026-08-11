import type { AvailabilitySlot, DayKey } from '@/types';

export const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'monday',    label: 'Segunda-feira', short: 'Seg' },
  { key: 'tuesday',   label: 'Terça-feira',   short: 'Ter' },
  { key: 'wednesday', label: 'Quarta-feira',  short: 'Qua' },
  { key: 'thursday',  label: 'Quinta-feira',  short: 'Qui' },
  { key: 'friday',    label: 'Sexta-feira',   short: 'Sex' },
  { key: 'saturday',  label: 'Sábado',        short: 'Sáb' },
  { key: 'sunday',    label: 'Domingo',       short: 'Dom' },
];

// 30-minute increments from 05:00 to 23:30
export const TIMES: string[] = Array.from({ length: 38 }, (_, i) => {
  const h = Math.floor(i / 2) + 5;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

export function endTimes(start: string): string[] {
  const idx = TIMES.indexOf(start);
  return idx === -1 ? TIMES.slice(1) : TIMES.slice(idx + 1);
}

export function formatAvailabilityLabel(slots: AvailabilitySlot[]): string {
  const active = slots.filter((s) => s.start && s.end);
  if (active.length === 0) return 'Sem horários configurados';

  const dayShort: Record<DayKey, string> = Object.fromEntries(
    DAYS.map((d) => [d.key, d.short]),
  ) as Record<DayKey, string>;

  const first = active[0]!;
  const firstKey = `${first.start}–${first.end}`;
  const allSame = active.every((s) => `${s.start}–${s.end}` === firstKey);

  const dayList = active.map((s) => dayShort[s.day]).join(', ');

  if (allSame) return `${dayList} · ${firstKey}`;
  return `${active.length} dia${active.length > 1 ? 's' : ''} configurado${active.length > 1 ? 's' : ''}`;
}
