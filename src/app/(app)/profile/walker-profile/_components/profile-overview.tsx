"use client";

import {
  AlertCircle,
  Briefcase,
  Calendar,
  ChevronRight,
  Dog,
  Eye,
  HeartHandshake,
  MapPin,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { WalkerProfile } from "@/types";
import { WalkerCard } from "@/app/(app)/walkers/_components/walker-card";
import { SECTION_META, type SectionKey, type SectionSummary } from "./profile-sections";

const ICONS: Record<SectionKey, React.ElementType> = {
  sobre: Briefcase,
  local: MapPin,
  horarios: Calendar,
  portes: Dog,
  especialidades: HeartHandshake,
  tags: Tag,
};

const STATE_LINE: Record<SectionSummary["state"], { text: string; className: string } | null> = {
  done: null,
  missing: { text: "Não preenchido", className: "text-amber-600 dark:text-amber-400" },
  incomplete: { text: "", className: "text-amber-600 dark:text-amber-400" },
  empty: { text: "Opcional, toque para adicionar", className: "text-muted-foreground" },
};

function SectionRow({ section, onOpen }: { section: SectionSummary; onOpen: () => void }) {
  const Icon = ICONS[section.key];
  const meta = SECTION_META[section.key];
  const needsWork = section.state === "missing" || section.state === "incomplete";
  const line = STATE_LINE[section.state];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-accent/60"
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          needsWork
            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{meta.title}</p>
        {section.summary && (
          <p
            className={cn(
              "line-clamp-2 text-sm",
              section.state === "incomplete" ? line?.className : "text-muted-foreground",
            )}
          >
            {section.summary}
          </p>
        )}
        {!section.summary && line && <p className={cn("text-sm", line.className)}>{line.text}</p>}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
    </button>
  );
}

/**
 * Phones only: the profile as tutors see it, then one row per part of it. A row opens that
 * part alone for editing, so the walker never scrolls a seven-card form to change one thing.
 */
export function ProfileOverview({
  preview,
  sections,
  onOpen,
}: {
  preview: WalkerProfile;
  sections: SectionSummary[];
  onOpen: (key: SectionKey) => void;
}) {
  const missing = sections.filter((s) => s.state === "missing" || s.state === "incomplete");
  const essentials = sections.filter((s) => !SECTION_META[s.key].optional);
  const optionals = sections.filter((s) => SECTION_META[s.key].optional);

  return (
    <div className="mb-0 space-y-6 md:hidden">
      {missing.length > 0 && (
        <section className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-foreground">
              {missing.length === 1 ? "Falta 1 item no seu perfil" : `Faltam ${missing.length} itens no seu perfil`}
            </p>
            <p className="text-sm text-muted-foreground">
              Quanto mais completo, mais os tutores encontram você.
            </p>
          </div>
        </section>
      )}

      {/* Walkers can't open the tutors' search, so this is the only place they see their
          own card. It's the real card component, made inert: a picture, not a link, and without
          the tutor's "Agendar passeio" button, which would look tappable here. */}
      <section className="space-y-2">
        <div className="flex items-center gap-1.5 px-1">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Seu card na busca</h2>
        </div>
        <p className="px-1 text-sm text-muted-foreground">É assim que os tutores veem você.</p>
        <div inert className="select-none [&_a[href^='/walks/new']]:hidden">
          <WalkerCard walker={preview} index={0} />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="px-1 text-base font-semibold text-foreground">Informações do perfil</h2>
        <Card className="gap-0 divide-y divide-border/60 overflow-hidden py-0">
          {essentials.map((s) => (
            <SectionRow key={s.key} section={s} onOpen={() => onOpen(s.key)} />
          ))}
        </Card>
      </section>

      <section className="space-y-2">
        <div className="px-1">
          <h2 className="text-base font-semibold text-foreground">Destaques</h2>
          <p className="text-sm text-muted-foreground">Opcionais, mas ajudam você a se destacar.</p>
        </div>
        <Card className="gap-0 divide-y divide-border/60 overflow-hidden py-0">
          {optionals.map((s) => (
            <SectionRow key={s.key} section={s} onOpen={() => onOpen(s.key)} />
          ))}
        </Card>
      </section>
    </div>
  );
}
