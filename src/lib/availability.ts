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

export interface AvailabilityGroup {
  /** "Seg", "Seg e Ter" or "Seg a Sex". */
  days: string;
  /** "07:00–18:00", or null while the day's hours aren't complete. */
  hours: string | null;
}

/**
 * Week order summary of the active days: consecutive days with the same hours
 * collapse into one group, so a typical week reads as one or two lines.
 */
export function groupAvailability(slots: AvailabilitySlot[]): AvailabilityGroup[] {
  const runs: { first: number; last: number; hours: string | null }[] = [];

  DAYS.forEach((day, index) => {
    const slot = slots.find((s) => s.day === day.key);
    if (!slot) return;
    const hours = slot.start && slot.end ? `${slot.start}–${slot.end}` : null;
    const prev = runs[runs.length - 1];
    if (prev && hours && prev.hours === hours && prev.last === index - 1) {
      prev.last = index;
    } else {
      runs.push({ first: index, last: index, hours });
    }
  });

  return runs.map(({ first, last, hours }) => {
    const from = DAYS[first]!.short;
    const to = DAYS[last]!.short;
    const days = first === last ? from : last === first + 1 ? `${from} e ${to}` : `${from} a ${to}`;
    return { days, hours };
  });
}
