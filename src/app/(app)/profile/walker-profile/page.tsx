"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckSquare,
  Loader2,
  MapPin,
  PartyPopper,
  Save,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWalkerProfile, useUpdateWalkerProfile } from "@/features/walkers/hooks/use-walkers";
import type { AvailabilitySlot, DogSize, WalkerProfileUpdate } from "@/types";
import { AvailabilityPicker } from "./_components/availability-picker";

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZE_OPTIONS: { value: DogSize; label: string }[] = [
  { value: "small",  label: "Pequeno" },
  { value: "medium", label: "Médio" },
  { value: "large",  label: "Grande" },
  { value: "giant",  label: "Gigante" },
];

const EXPERTISE_OPTIONS: { value: string; label: string }[] = [
  { value: "agitado",       label: "Agitados" },
  { value: "reativo",       label: "Reativos" },
  { value: "ansioso",       label: "Ansiosos" },
  { value: "filhote",       label: "Filhotes" },
  { value: "idoso",         label: "Idosos" },
  { value: "medicacao",     label: "Com medicação" },
  { value: "multiplos-caes", label: "Múltiplos cães" },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 rounded-xl bg-muted" />
      <div className="h-24 rounded-xl bg-muted" />
      <div className="h-32 rounded-xl bg-muted" />
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-3.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 shrink-0">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <CardContent className="p-5 space-y-4">{children}</CardContent>
    </Card>
  );
}

// ─── Tags input ───────────────────────────────────────────────────────────────

function TagsInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addTag() {
    const trimmed = input.trim();
    if (!trimmed || tags.includes(trimmed)) {
      setInput("");
      return;
    }
    onChange([...tags, trimmed]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          placeholder="Ex: Pontual, Experiente..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addTag(); }
          }}
          className="rounded-lg"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag} className="shrink-0 rounded-lg">
          Adicionar
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1.5">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 cursor-pointer"
                aria-label={`Remover ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Checkbox group ───────────────────────────────────────────────────────────

function CheckboxGroup<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (values: T[]) => void;
}) {
  function toggle(value: T) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, label }) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            <CheckSquare className={cn("h-3.5 w-3.5 shrink-0", active ? "opacity-100" : "opacity-30")} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WalkerProfilePage() {
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";

  const { data: profile, isLoading } = useWalkerProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateWalkerProfile();

  const [form, setForm] = useState<WalkerProfileUpdate>({
    description: "",
    location: "",
    serviceArea: "",
    availability: [],
    tags: [],
    supportedSizes: [],
    behaviorExpertise: [],
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      description:       profile.description,
      location:          profile.location,
      serviceArea:       profile.serviceArea,
      availability:      profile.availability,
      tags:              [...profile.tags],
      supportedSizes:    [...profile.supportedSizes],
      behaviorExpertise: [...profile.behaviorExpertise],
    });
  }, [profile]);

  function handleSave() {
    updateProfile(form, {
      onSuccess: () => toast.success("Perfil profissional atualizado!"),
      onError:   () => toast.error("Erro ao salvar. Tente novamente."),
    });
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-7 w-48 rounded bg-muted" />
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 pb-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" render={<Link href="/profile" />} aria-label="Voltar">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Perfil profissional</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Informações exibidas para os clientes.</p>
        </div>
      </div>

      {/* Onboarding banner — shown only right after walker registration */}
      {isOnboarding && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <PartyPopper className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Bem-vindo ao DogTravel!</p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Complete seu perfil profissional para aparecer nas buscas e começar a receber
              solicitações de passeio. Quanto mais completo, maior sua visibilidade.
            </p>
          </div>
        </div>
      )}

      {/* Sobre você */}
      <Section icon={Briefcase} title="Sobre você">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Apresentação
          </Label>
          <Textarea
            value={form.description}
            rows={4}
            placeholder="Descreva sua experiência, abordagem e diferenciais..."
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="rounded-lg resize-none"
          />
        </div>
      </Section>

      {/* Localização */}
      <Section icon={MapPin} title="Localização e área de atendimento">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Bairro / Cidade
          </Label>
          <Input
            value={form.location}
            placeholder="Ex: Pinheiros, São Paulo"
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="rounded-lg"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Área de atendimento
          </Label>
          <Input
            value={form.serviceArea}
            placeholder="Ex: Pinheiros, Vila Madalena e Perdizes"
            onChange={(e) => setForm((f) => ({ ...f, serviceArea: e.target.value }))}
            className="rounded-lg"
          />
        </div>
      </Section>

      {/* Disponibilidade */}
      <Section icon={Calendar} title="Disponibilidade semanal">
        <p className="text-xs text-muted-foreground -mt-1">
          Ative os dias em que você trabalha e selecione os horários disponíveis em cada um.
        </p>
        <AvailabilityPicker
          value={(form.availability as AvailabilitySlot[]) ?? []}
          onChange={(v) => setForm((f) => ({ ...f, availability: v }))}
        />
      </Section>

      {/* Portes atendidos */}
      <Section icon={CheckSquare} title="Portes atendidos">
        <CheckboxGroup
          options={SIZE_OPTIONS}
          selected={form.supportedSizes ?? []}
          onChange={(v) => setForm((f) => ({ ...f, supportedSizes: v }))}
        />
      </Section>

      {/* Especialidades */}
      <Section icon={CheckSquare} title="Especialidades comportamentais">
        <CheckboxGroup
          options={EXPERTISE_OPTIONS}
          selected={form.behaviorExpertise ?? []}
          onChange={(v) => setForm((f) => ({ ...f, behaviorExpertise: v }))}
        />
      </Section>

      {/* Tags personalizadas */}
      <Section icon={Tag} title="Tags de destaque">
        <p className="text-xs text-muted-foreground -mt-1">
          Palavras-chave que aparecem no seu card de perfil (ex: Pontual, Experiente, Dog Lover).
        </p>
        <TagsInput
          tags={form.tags ?? []}
          onChange={(v) => setForm((f) => ({ ...f, tags: v }))}
        />
      </Section>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 rounded-lg shadow-sm">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Salvando..." : "Salvar perfil"}
        </Button>
      </div>
    </div>
  );
}
