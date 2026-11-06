'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DAYS, TIMES, endTimes } from '@/lib/availability';
import type { AvailabilitySlot, DayKey } from '@/types';

// ─── Time Select ──────────────────────────────────────────────────────────────

interface TimeSelectProps {
  id?: string;
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}

function TimeSelect({ id, value, options, placeholder, disabled, onChange }: TimeSelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full cursor-pointer appearance-none rounded-lg border bg-background px-3 py-2 pr-8 text-base md:text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          disabled
            ? 'cursor-not-allowed border-border/30 bg-muted/40 text-muted-foreground/50'
            : value
              ? 'border-border text-foreground hover:border-primary/40 focus:border-primary/50'
              : 'border-border text-muted-foreground hover:border-primary/40 focus:border-primary/50',
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          'pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transition-colors',
          disabled ? 'text-muted-foreground/30' : 'text-muted-foreground',
        )}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  value: AvailabilitySlot[];
  onChange: (v: AvailabilitySlot[]) => void;
}

export function AvailabilityPicker({ value, onChange }: Props) {
  function getEntry(day: DayKey) {
    return value.find((s) => s.day === day);
  }

  function isDayActive(day: DayKey) {
    return value.some((s) => s.day === day);
  }

  function toggleDay(day: DayKey, active: boolean) {
    if (active) {
      onChange([...value, { day, start: '', end: '' }]);
    } else {
      onChange(value.filter((s) => s.day !== day));
    }
  }

  function setStart(day: DayKey, start: string) {
    onChange(
      value.map((s) => {
        if (s.day !== day) return s;
        // If the current end is no longer valid, clear it
        const validEnd = start && s.end > start ? s.end : '';
        return { ...s, start, end: validEnd };
      }),
    );
  }

  function setEnd(day: DayKey, end: string) {
    onChange(value.map((s) => (s.day === day ? { ...s, end } : s)));
  }

  return (
    <div className="space-y-2">
      {DAYS.map((day) => {
        const active = isDayActive(day.key);
        const entry = getEntry(day.key);
        const availableEndTimes = entry?.start ? endTimes(entry.start) : TIMES.slice(1);
        const hasConflict = active && entry?.start && entry?.end && entry.end <= entry.start;

        return (
          <div
            key={day.key}
            className={cn(
              'overflow-hidden rounded-xl border transition-all duration-200',
              active
                ? 'border-primary/20 bg-primary/[0.025] shadow-sm'
                : 'border-border/50 bg-muted/10',
            )}
          >
            {/* ── Day header ───────────────────────────────────── */}
            <button
              type="button"
              onClick={() => toggleDay(day.key, !active)}
              className={cn(
                'flex w-full cursor-pointer items-center justify-between px-4 py-3 transition-colors',
                active ? 'hover:bg-primary/5' : 'hover:bg-muted/30',
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {day.label}
              </span>

              {/* Toggle pill */}
              <span
                className={cn(
                  'relative h-5 w-9 shrink-0 rounded-full border-2 transition-all duration-200',
                  active ? 'border-primary bg-primary' : 'border-border bg-muted',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-all duration-200',
                    active ? 'left-[18px]' : 'left-0.5',
                  )}
                />
              </span>
            </button>

            {/* ── Time selectors ────────────────────────────────── */}
            {active && (
              <div className="border-t border-border/40 px-4 pb-4 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Start */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`start-${day.key}`}
                      className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Início
                    </label>
                    <TimeSelect
                      id={`start-${day.key}`}
                      value={entry?.start ?? ''}
                      options={TIMES.slice(0, -1)} // up to 23:00 so there's room for an end time
                      placeholder="-- : --"
                      onChange={(v) => setStart(day.key, v)}
                    />
                  </div>

                  {/* End */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor={`end-${day.key}`}
                      className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      Término
                    </label>
                    <TimeSelect
                      id={`end-${day.key}`}
                      value={entry?.end ?? ''}
                      options={availableEndTimes}
                      placeholder={entry?.start ? '-- : --' : 'Selecione o início'}
                      disabled={!entry?.start}
                      onChange={(v) => setEnd(day.key, v)}
                    />
                  </div>
                </div>

                {/* Conflict warning (should never happen with filtered options, but just in case) */}
                {hasConflict && (
                  <p className="mt-2 text-xs font-medium text-destructive">
                    O horário de término deve ser após o horário de início.
                  </p>
                )}

                {/* Friendly summary */}
                {entry?.start && entry?.end && (
                  <p className="mt-2.5 text-xs text-muted-foreground">
                    Expediente de{' '}
                    <span className="font-semibold text-foreground">
                      {entry.start}
                    </span>{' '}
                    às{' '}
                    <span className="font-semibold text-foreground">
                      {entry.end}
                    </span>
                    {' '}·{' '}
                    {(() => {
                      const toMinutes = (hhmm: string) => {
                        const [h = 0, m = 0] = hhmm.split(':').map(Number);
                        return h * 60 + m;
                      };
                      const total = toMinutes(entry.end) - toMinutes(entry.start);
                      const h = Math.floor(total / 60);
                      const m = total % 60;
                      return m === 0 ? `${h}h de trabalho` : `${h}h${m}min de trabalho`;
                    })()}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
