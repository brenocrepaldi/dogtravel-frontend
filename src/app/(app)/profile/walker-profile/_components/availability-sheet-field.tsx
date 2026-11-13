'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DAYS, groupAvailability } from '@/lib/availability';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { AvailabilitySlot } from '@/types';
import { AvailabilityPicker } from './availability-picker';

interface Props {
  value: AvailabilitySlot[];
  onChange: (v: AvailabilitySlot[]) => void;
}

/**
 * Phones only: the week as a short summary, with the full picker in a bottom sheet.
 * Seven day cards inline pushed the rest of the form (sizes, expertise, tags) a
 * whole screen down. Edits apply to the form as they happen, like the inline picker;
 * "Salvar perfil" still publishes them.
 */
export function AvailabilitySheetField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const groups = groupAvailability(value);
  const activeDays = new Set(value.map((s) => s.day));

  return (
    // mb-0: the hidden inline picker after this is the card's last child, so the card's
    // space-y would otherwise add a bottom margin here.
    <div className="mb-0 space-y-3 md:hidden">
      {/* At-a-glance week; the list below carries the same information for screen readers. */}
      <div className="flex gap-1.5" aria-hidden="true">
        {DAYS.map((day) => (
          <span
            key={day.key}
            className={cn(
              'flex h-9 flex-1 items-center justify-center rounded-lg text-xs font-semibold',
              activeDays.has(day.key)
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {day.short}
          </span>
        ))}
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum dia de trabalho ativo.</p>
      ) : (
        <ul className="space-y-1.5">
          {groups.map((g) => (
            <li key={g.days} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-foreground">{g.days}</span>
              {g.hours ? (
                <span className="tabular-nums text-muted-foreground">{g.hours}</span>
              ) : (
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  Horário incompleto
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full gap-2 rounded-lg text-sm"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-4 w-4" />
        Editar horários
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[90dvh] gap-0 rounded-t-2xl p-0 md:hidden">
          <SheetHeader className="border-b border-border/60 px-4 pb-3 pt-4 pr-14">
            <SheetTitle>Disponibilidade semanal</SheetTitle>
            <SheetDescription>
              Ative os dias em que você trabalha e escolha os horários. Depois, toque em Salvar
              perfil.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            <AvailabilityPicker value={value} onChange={onChange} />
          </div>
          <SheetFooter className="border-t border-border/60 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <Button type="button" className="h-12 w-full text-base" onClick={() => setOpen(false)}>
              Concluir
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
