"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
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
import { Button, TOUCH_TARGET } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/utils";
import { useWalkerProfile, useUpdateWalkerProfile } from "@/features/walkers/hooks/use-walkers";
import type { AvailabilitySlot, WalkerProfile, WalkerProfileUpdate } from "@/types";
import { AvailabilityPicker } from "./_components/availability-picker";
import { ProfileOverview } from "./_components/profile-overview";
import {
  EXPERTISE_OPTIONS,
  SECTION_META,
  SIZE_OPTIONS,
  parseSection,
  summarizeProfile,
  type SectionKey,
} from "./_components/profile-sections";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

// Shaped like the section cards (icon + title header, then fields), so the form
// doesn't jump when it arrives.
function ProfileSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6" aria-hidden="true">
      {["h-28", "h-40", "h-64"].map((body) => (
        <Card key={body} className="overflow-hidden py-0 gap-0">
          <div className="flex items-center gap-2.5 border-b border-border/60 px-4 py-3.5 md:px-5">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-2 p-4 md:p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className={cn("w-full rounded-lg", body)} />
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function PageHeader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Button
        variant="ghost"
        size="icon-sm"
        render={<Link href="/profile" />}
        aria-label="Voltar"
        className="max-md:-ml-2 max-md:size-11"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Perfil profissional</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Informações exibidas para os clientes.</p>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ icon: Icon, title, className, contentClassName, children }: {
  icon: React.ElementType;
  title: string;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    // Phones edit one section per screen, titled by the page header, so the strip is md+ only.
    <Card className={cn("overflow-hidden py-0 gap-0", className)}>
      <div className="flex items-center gap-2.5 border-b border-border/60 px-4 py-3.5 max-md:hidden md:px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 shrink-0">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <CardContent className={cn("p-4 space-y-4 md:p-5", contentClassName)}>{children}</CardContent>
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
          enterKeyHint="done"
          autoComplete="off"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addTag(); }
          }}
          className="rounded-lg"
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag} className="shrink-0 rounded-lg max-md:h-11 max-md:px-4 max-md:text-sm">
          Adicionar
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 max-md:gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1.5 max-md:h-7 max-md:gap-1.5 max-md:px-2.5 max-md:text-sm">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className={cn("relative ml-0.5 rounded-sm opacity-60 hover:opacity-100 cursor-pointer", TOUCH_TARGET)}
                aria-label={`Remover ${tag}`}
              >
                <X className="h-3 w-3 max-md:h-3.5 max-md:w-3.5" />
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
            aria-pressed={active}
            className={cn(
              "relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer max-md:h-10 max-md:px-3.5 max-md:text-sm",
              TOUCH_TARGET,
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {/* A faded check reads as "checked" on a small screen, so phones show it only when active. */}
            <CheckSquare className={cn("h-3.5 w-3.5 shrink-0", active ? "opacity-100" : "opacity-30 max-md:hidden")} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

// ─── Mobile header ────────────────────────────────────────────────────────────

// Phones: the overview's title, or the open section's title with a back arrow to the overview.
function MobileHeader({ section, onBack }: { section: SectionKey | null; onBack: () => void }) {
  const title = section ? SECTION_META[section].title : "Perfil profissional";
  const hint = section ? SECTION_META[section].hint : "Informações exibidas para os tutores";
  const backClass =
    "-ml-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors active:bg-accent/60";

  return (
    <div className="flex items-center gap-1 md:hidden">
      {section ? (
        <button type="button" onClick={onBack} aria-label="Voltar ao perfil profissional" className={backClass}>
          <ArrowLeft className="h-5 w-5" />
        </button>
      ) : (
        <Link href="/profile" aria-label="Voltar ao perfil" className={backClass}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
      )}
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function formFromProfile(profile: WalkerProfile): WalkerProfileUpdate {
  return {
    description:       profile.description,
    location:          profile.location,
    serviceArea:       profile.serviceArea,
    availability:      profile.availability,
    tags:              [...profile.tags],
    supportedSizes:    [...profile.supportedSizes],
    behaviorExpertise: [...profile.behaviorExpertise],
  };
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WalkerProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";
  // Phones: ?secao=<key> edits one section on its own screen; without it, the overview.
  // md+ ignores it and keeps the full form.
  const section = parseSection(searchParams.get("secao"));

  const { data: profile, isLoading, isError, refetch, isRefetching } = useWalkerProfile();
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

  // Seed the form whenever a (new) profile arrives. Adjusting state while
  // rendering, guarded by the profile reference, avoids a setState-in-effect.
  const [seededFrom, setSeededFrom] = useState<typeof profile>(undefined);
  if (profile && profile !== seededFrom) {
    setSeededFrom(profile);
    setForm(formFromProfile(profile));
  }

  // Leaving a section without saving (Cancelar, the back arrow or the phone's back gesture)
  // drops its edits, so the overview never shows changes that weren't saved.
  const [openedHere, setOpenedHere] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [prevSection, setPrevSection] = useState(section);
  if (section !== prevSection) {
    setPrevSection(section);
    if (prevSection && !section && !justSaved && profile) setForm(formFromProfile(profile));
    setJustSaved(false);
  }

  function sectionHref(key: SectionKey | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (key) params.set("secao", key);
    else params.delete("secao");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  function openSection(key: SectionKey) {
    setOpenedHere(true);
    router.push(sectionHref(key));
  }

  function closeSection() {
    // Opened from the overview: step back in history, so the back gesture doesn't return
    // to the section. Opened from a link: replace it with the overview.
    if (openedHere) router.back();
    else router.replace(sectionHref(null));
  }

  function handleSave() {
    updateProfile(form, {
      onSuccess: () => {
        toast.success("Perfil profissional atualizado!");
        if (section) {
          setJustSaved(true);
          closeSection();
        }
      },
      onError:   () => toast.error("Erro ao salvar. Tente novamente."),
    });
  }

  /** Phones show only the open section; md+ shows every section. */
  const mobileOnly = (key: SectionKey) => (section === key ? undefined : "max-md:hidden");

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4 pb-8 md:space-y-6">
        <PageHeader />
        <ProfileSkeleton />
      </div>
    );
  }

  // Without the saved profile the form would start empty, and saving it would wipe the
  // walker's real profile, so a failed load offers a retry instead of the form.
  if (isError && !profile) {
    return (
      <div className="max-w-2xl space-y-4 pb-8 md:space-y-6">
        <PageHeader />
        <EmptyState
          icon={AlertCircle}
          title="Não foi possível carregar seu perfil"
          description="Verifique sua conexão e tente de novo. Nada do que você salvou foi perdido."
          actionLabel={isRefetching ? "Carregando..." : "Tentar novamente"}
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className={cn("group/form max-w-2xl space-y-4 pb-8 md:space-y-6", section && "max-md:pb-20")}>

      <MobileHeader section={section} onBack={closeSection} />
      <PageHeader className="max-md:hidden" />

      {/* Onboarding banner — shown only right after walker registration */}
      {isOnboarding && (
        <div className={cn("rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 flex items-start gap-3", section && "max-md:hidden")}>
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

      {!section && profile && (
        <ProfileOverview
          preview={{ ...profile, ...form } as WalkerProfile}
          sections={summarizeProfile(form)}
          onOpen={openSection}
        />
      )}

      {/* Sobre você */}
      <Section icon={Briefcase} title="Sobre você" className={mobileOnly("sobre")}>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground max-md:sr-only">
            Apresentação
          </Label>
          <Textarea
            value={form.description}
            rows={4}
            autoCapitalize="sentences"
            placeholder="Descreva sua experiência, abordagem e diferenciais..."
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="rounded-lg resize-none max-md:min-h-48"
          />
        </div>
      </Section>

      {/* Localização */}
      <Section icon={MapPin} title="Localização e área de atendimento" className={mobileOnly("local")}>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground max-md:text-sm max-md:normal-case max-md:tracking-normal max-md:text-foreground">
            Bairro / Cidade
          </Label>
          <Input
            value={form.location}
            placeholder="Ex: Pinheiros, São Paulo"
            autoCapitalize="words"
            enterKeyHint="next"
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="rounded-lg"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground max-md:text-sm max-md:normal-case max-md:tracking-normal max-md:text-foreground">
            Área de atendimento
          </Label>
          <Input
            value={form.serviceArea}
            placeholder="Ex: Pinheiros, Vila Madalena e Perdizes"
            autoCapitalize="words"
            enterKeyHint="done"
            onChange={(e) => setForm((f) => ({ ...f, serviceArea: e.target.value }))}
            className="rounded-lg"
          />
        </div>
      </Section>

      {/* Disponibilidade — phones get the seven days on their own screen, straight on the page
          background: the day cards are cards already. */}
      <Section
        icon={Calendar}
        title="Disponibilidade semanal"
        className={cn(mobileOnly("horarios"), "max-md:bg-transparent max-md:ring-0")}
        contentClassName="max-md:p-0"
      >
        <p className="text-xs text-muted-foreground -mt-1 max-md:hidden">
          Ative os dias em que você trabalha e selecione os horários disponíveis em cada um.
        </p>
        <AvailabilityPicker
          value={(form.availability as AvailabilitySlot[]) ?? []}
          onChange={(v) => setForm((f) => ({ ...f, availability: v }))}
        />
      </Section>

      {/* Portes atendidos */}
      <Section icon={CheckSquare} title="Portes atendidos" className={mobileOnly("portes")}>
        <CheckboxGroup
          options={SIZE_OPTIONS}
          selected={form.supportedSizes ?? []}
          onChange={(v) => setForm((f) => ({ ...f, supportedSizes: v }))}
        />
      </Section>

      {/* Especialidades */}
      <Section icon={CheckSquare} title="Especialidades comportamentais" className={mobileOnly("especialidades")}>
        <CheckboxGroup
          options={EXPERTISE_OPTIONS}
          selected={form.behaviorExpertise ?? []}
          onChange={(v) => setForm((f) => ({ ...f, behaviorExpertise: v }))}
        />
      </Section>

      {/* Tags personalizadas */}
      <Section icon={Tag} title="Tags de destaque" className={mobileOnly("tags")}>
        <p className="text-xs text-muted-foreground -mt-1 max-md:text-sm">
          Palavras-chave que aparecem no seu card de perfil (ex: Pontual, Experiente, Dog Lover).
        </p>
        <TagsInput
          tags={form.tags ?? []}
          onChange={(v) => setForm((f) => ({ ...f, tags: v }))}
        />
      </Section>

      {/* Save. md+: one button under the whole form. Phones: only on a section's screen, with
          Cancelar beside it, floating above the bottom nav. It is position: fixed like the nav —
          a sticky bar inside the scroll container got stuck mid-screen on iOS after the
          keyboard closed — and hides while a text field is focused so it never covers it. */}
      <div className={cn(
        "flex justify-end max-md:fixed max-md:inset-x-0 max-md:bottom-[calc(5.75rem+env(safe-area-inset-bottom))] max-md:z-30 max-md:gap-2 max-md:px-4 max-md:group-has-[:is(input,textarea):focus]/form:hidden",
        !section && "max-md:hidden",
      )}>
        <Button
          type="button"
          variant="outline"
          onClick={closeSection}
          disabled={isSaving}
          className="h-12 flex-1 rounded-lg bg-background text-base shadow-lg md:hidden"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 rounded-lg shadow-sm max-md:h-12 max-md:flex-1 max-md:text-base max-md:shadow-lg max-md:shadow-primary/25"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Salvando..." : <><span className="md:hidden">Salvar</span><span className="max-md:hidden">Salvar perfil</span></>}
        </Button>
      </div>
    </div>
  );
}
