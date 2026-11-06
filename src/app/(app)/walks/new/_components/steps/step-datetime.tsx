"use client";

import { AlertTriangle, ArrowRight, CalendarClock } from "lucide-react";
import { FlowActions } from "@/components/common/flow-actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAvailableWalkers } from "@/features/walkers/hooks/use-walkers";
import type { WalkFormData } from "../walk-request-form";

const DURATION_OPTIONS = [15, 30, 45, 60] as const;

interface Props {
  data: WalkFormData;
  updateData: (partial: Partial<WalkFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepDateTime({ data, updateData, onNext, onBack }: Props) {
  const isValid = data.date && data.time && data.durationMinutes > 0;
  const today   = new Date().toISOString().split("T")[0];

  const slotComplete = Boolean(data.selectedWalkerId && data.date && data.time && data.durationMinutes > 0);
  const { data: availableWalkers } = useAvailableWalkers(
    { date: data.date, time: data.time, durationMinutes: data.durationMinutes },
    slotComplete,
  );
  const preSelectedUnavailable =
    slotComplete &&
    availableWalkers !== undefined &&
    !availableWalkers.some((w) => w.id === data.selectedWalkerId);

  function openPicker(e: React.FocusEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    // Wait for React to commit the type change before calling showPicker
    setTimeout(() => input.showPicker?.(), 50);
  }

  const previewLabel =
    data.date && data.time
      ? new Date(data.date + "T" + data.time).toLocaleString("pt-BR", {
          weekday: "long",
          day:     "2-digit",
          month:   "long",
          hour:    "2-digit",
          minute:  "2-digit",
        })
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Data, horário e duração</h2>
        <p className="text-sm text-muted-foreground">
          Quando você quer que o passeio aconteça?
        </p>
      </div>

      {/* Date + Time side by side */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-sm font-medium">
            Data
          </Label>
          <Input
            id="date"
            type={data.date ? "date" : undefined}
            placeholder="dd/mm/aaaa"
            min={today}
            value={data.date}
            onChange={(e) => updateData({ date: e.target.value })}
            onFocus={(e) => { e.currentTarget.type = "date"; openPicker(e); }}
            onBlur={(e)  => { if (!data.date) e.currentTarget.type = "text"; }}
            className="cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="time" className="text-sm font-medium">
            Horário
          </Label>
          <Input
            id="time"
            type={data.time ? "time" : undefined}
            placeholder="hh:mm"
            value={data.time}
            onChange={(e) => updateData({ time: e.target.value })}
            onFocus={(e) => { e.currentTarget.type = "time"; openPicker(e); }}
            onBlur={(e)  => { if (!data.time) e.currentTarget.type = "text"; }}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* Duration chips */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Duração</Label>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => updateData({ durationMinutes: min })}
              className={cn(
                "px-5 py-2 rounded-lg border text-sm font-medium transition-all duration-150 cursor-pointer",
                data.durationMinutes === min
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {min} min
            </button>
          ))}
        </div>
      </div>

      {/* Preview when all filled */}
      {previewLabel && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarClock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground capitalize">{previewLabel}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.durationMinutes} minutos de duração
            </p>
          </div>
        </div>
      )}

      {preSelectedUnavailable && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Passeador indisponível neste horário
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
              O passeador selecionado não está disponível nesta data e horário. Você pode continuar e outro passeador será atribuído automaticamente.
            </p>
          </div>
        </div>
      )}

      <FlowActions
        showBack
        onBack={onBack}
        primaryLabel="Continuar"
        primaryIcon={<ArrowRight className="h-4 w-4" />}
        onPrimary={onNext}
        primaryDisabled={!isValid}
      />
    </div>
  );
}
