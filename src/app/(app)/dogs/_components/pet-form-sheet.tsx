import { useRef, useState } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, Dog, Info, Ruler, Sparkles, X } from "lucide-react";
import {
  PET_IMAGE_ACCEPT,
  validatePetImage,
} from "@/lib/validations/pet";
import type { DogGender, DogSize } from "@/types";
import { DOG_SIZE_TEXT_OPTIONS } from "@/lib/pets";
import { cn } from "@/lib/utils";

export interface PetDraft {
  name: string;
  breed: string;
  age: number;
  size: DogSize;
  gender: DogGender;
  behavior: string;
  photoUrl?: string;
}

interface PetFormState {
  name: string;
  breed: string;
  age: string;
  size: DogSize;
  gender: DogGender;
  behavior: string;
  photoUrl: string | null;
}

function toFormState(petToEdit?: PetDraft | null): PetFormState {
  if (!petToEdit) {
    return {
      name: "",
      breed: "",
      age: "",
      size: "medium",
      gender: "male",
      behavior: "",
      photoUrl: null,
    };
  }
  return {
    name: petToEdit.name,
    breed: petToEdit.breed,
    age: String(petToEdit.age),
    size: petToEdit.size,
    gender: petToEdit.gender,
    behavior: petToEdit.behavior,
    photoUrl: petToEdit.photoUrl ?? null,
  };
}

interface PetFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petToEdit?: PetDraft | null;
  onSave: (pet: PetDraft) => void;
}

// Campo de input estilizado com label integrado
function Field({
  label,
  required,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={htmlFor}
          className="text-sm font-medium text-foreground"
        >
          {label}
          {required && (
            <span className="text-destructive ml-1 font-normal">*</span>
          )}
        </Label>
        {hint && (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

interface PhotoUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    const error = validatePetImage(file);
    if (error) {
      toast.error(error);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };
    reader.onerror = () => {
      toast.error("Não foi possível ler a imagem. Tente outro arquivo.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const openFilePicker = () => inputRef.current?.click();

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={PET_IMAGE_ACCEPT}
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Enviar foto do pet"
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex items-center gap-4 p-4 rounded-2xl border border-dashed bg-muted/20 transition-all duration-200 cursor-pointer group",
          isDragging
            ? "border-primary/50 bg-primary/5"
            : "border-border hover:bg-muted/30 hover:border-border/80"
        )}
      >
        <div
          className={cn(
            "relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 ring-1 transition-colors",
            value
              ? "ring-border/60"
              : "bg-primary/8 ring-primary/15 group-hover:bg-primary/12"
          )}
        >
          {value ? (
            <Image
              src={value}
              alt="Pré-visualização da foto do pet"
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-3xl" role="img" aria-label="pet">
                🐾
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 pr-8">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Camera className="w-3.5 h-3.5 text-primary/70" />
            <p className="text-sm font-medium text-foreground">Foto do pet</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {value
              ? "Clique para trocar a foto."
              : "Envie uma foto para tornar o perfil mais pessoal."}{" "}
            <span className="text-primary/70 font-medium">
              {value ? "Trocar arquivo" : "Escolher arquivo"}
            </span>
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            JPG, PNG — máx. 5MB
          </p>
        </div>

        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-background/90 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 cursor-pointer"
            aria-label="Remover foto"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Separador visual de seção
function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

export function PetFormSheet({
  open,
  onOpenChange,
  petToEdit,
  onSave,
}: PetFormSheetProps) {
  const [formData, setFormData] = useState<PetFormState>(() =>
    toFormState(petToEdit)
  );
  const [errors, setErrors] = useState<Partial<Record<keyof PetFormState, string>>>({});

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!formData.name.trim()) next.name = "Nome é obrigatório";
    if (!formData.breed.trim()) next.breed = "Raça é obrigatória";
    if (!formData.age || Number(formData.age) < 0) next.age = "Informe a idade";
    if (!formData.size) next.size = "Selecione o porte";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    onSave({
      name: formData.name,
      breed: formData.breed,
      age: Number.parseInt(formData.age, 10),
      size: formData.size,
      gender: formData.gender,
      behavior: formData.behavior,
      photoUrl: formData.photoUrl ?? undefined,
    });
    toast.success(
      petToEdit ? "Dados do cão atualizados!" : "Cão adicionado com sucesso!"
    );
    onOpenChange(false);
  };

  const set = (key: keyof PetFormState) => (val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const isEditing = !!petToEdit;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="center"
        className="flex flex-col p-0 overflow-hidden border-border/60 sm:max-w-xl"
      >
        {/* ── Header do sheet ──────────────────────────────── */}
        <div className="relative px-6 pt-6 pb-5 border-b border-border/50 bg-card shrink-0">
          {/* Faixa decorativa no topo */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 ring-1 ring-primary/15 flex items-center justify-center shrink-0 mt-0.5">
              <Dog className="w-5 h-5 text-primary" />
            </div>
            <SheetHeader className="p-0 space-y-0.5 text-left">
              <SheetTitle className="text-base font-semibold leading-tight">
                {isEditing ? `Editar ${petToEdit.name}` : "Cadastrar Novo Cão"}
              </SheetTitle>
              <SheetDescription className="text-xs leading-relaxed text-muted-foreground">
                {isEditing
                  ? "Atualize as informações do seu pet."
                  : "Preencha os dados do seu pet para facilitar os passeios."}
              </SheetDescription>
            </SheetHeader>
          </div>
        </div>

        {/* ── Formulário ──────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
        >
          <PhotoUpload
            value={formData.photoUrl}
            onChange={(photoUrl) =>
              setFormData((prev) => ({ ...prev, photoUrl }))
            }
          />

          {/* Seção: Identificação */}
          <div className="space-y-4">
            <SectionLabel
              icon={<Sparkles className="w-3 h-3" />}
              label="Identificação"
            />

            <Field label="Nome do cão" required htmlFor="pet-name">
              <Input
                id="pet-name"
                placeholder="Ex: Rex"
                value={formData.name}
                onChange={(e) => set("name")(e.target.value)}
                className={cn(
                  "rounded-md transition-all",
                  errors.name && "border-destructive/70 focus-visible:ring-destructive/30"
                )}
              />
              {errors.name && (
                <p className="text-[11px] text-destructive mt-1">{errors.name}</p>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Raça" required htmlFor="pet-breed">
                <Input
                  id="pet-breed"
                  placeholder="Ex: Poodle"
                  value={formData.breed}
                  onChange={(e) => set("breed")(e.target.value)}
                  className={cn(
                    "rounded-md",
                    errors.breed && "border-destructive/70"
                  )}
                />
                {errors.breed && (
                  <p className="text-[11px] text-destructive mt-1">{errors.breed}</p>
                )}
              </Field>

              <Field label="Idade" required hint="em anos" htmlFor="pet-age">
                <Input
                  id="pet-age"
                  type="number"
                  min="0"
                  max="30"
                  placeholder="Ex: 3"
                  value={formData.age}
                  onChange={(e) => set("age")(e.target.value)}
                  className={cn(
                    "rounded-md",
                    errors.age && "border-destructive/70"
                  )}
                />
                {errors.age && (
                  <p className="text-[11px] text-destructive mt-1">{errors.age}</p>
                )}
              </Field>
            </div>

            <Field label="Sexo" required>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "male",   label: "Macho", symbol: "♂" },
                    { value: "female", label: "Fêmea", symbol: "♀" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, gender: option.value }))
                    }
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
                      formData.gender === option.value
                        ? option.value === "male"
                          ? "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                          : "border-pink-500/50 bg-pink-500/10 text-pink-700 dark:text-pink-400"
                        : "border-border bg-transparent text-muted-foreground hover:bg-muted/40"
                    )}
                  >
                    <span className="text-base leading-none">{option.symbol}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* Seção: Porte */}
          <div className="space-y-4">
            <SectionLabel
              icon={<Ruler className="w-3 h-3" />}
              label="Porte"
            />

            <Field label="Porte do cão" required htmlFor="pet-size">
              <Select
                value={formData.size}
                onValueChange={(v) => set("size")(v as DogSize)}
              >
                <SelectTrigger
                  id="pet-size"
                  className={cn(
                    "w-full",
                    errors.size && "border-destructive/70"
                  )}
                >
                  <SelectValue placeholder="Selecione o porte" />
                </SelectTrigger>
                <SelectContent>
                  {DOG_SIZE_TEXT_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.size && (
                <p className="text-[11px] text-destructive mt-1">{errors.size}</p>
              )}
            </Field>
          </div>

          {/* Seção: Observações */}
          <div className="space-y-4">
            <SectionLabel
              icon={<Info className="w-3 h-3" />}
              label="Comportamento"
            />

            <Field
              label="Observações especiais"
              hint="opcional"
              htmlFor="pet-behavior"
            >
              <textarea
                id="pet-behavior"
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
                placeholder="Ex: Muito brincalhão, mas tem medo de motos. Puxa muito a guia no começo do passeio."
                value={formData.behavior}
                onChange={(e) => set("behavior")(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground/70 mt-1.5 leading-relaxed">
                Essas informações ajudam o passeador a preparar o passeio ideal.
              </p>
            </Field>
          </div>
        </form>

        {/* ── Footer com ações ─────────────────────────────── */}
        <div className="shrink-0 px-6 py-4 border-t border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 shadow-sm hover:shadow-md"
              onClick={handleSubmit}
            >
              {isEditing ? "Salvar alterações" : "Adicionar cão"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
