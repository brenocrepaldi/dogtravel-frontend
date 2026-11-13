"use client";

import { useState } from "react";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileCheck2,
  Loader2,
  Lock,
  Plus,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, TOUCH_TARGET } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { DocStatus, WalkerCertDocument } from "@/types";
import { PendingBanner, RejectedBanner, VerifiedBanner } from "./walker-documents-badges";
import { UploadZone } from "./walker-documents-upload-zone";
import { BACKGROUND_COPY, IDENTITY_COPY } from "./walker-documents-copy";

// Phones only. The desktop page stacks four tall cards with a badge, a banner and a
// paragraph each; on a phone that buried the one answer the walker comes for ("can I
// take walks, and what's missing?"). Here the page is a status hero, a two-row list of
// requirements whose color and one-line status carry the state, and certifications.
// Everything long (explanations, uploads) lives in a bottom sheet per requirement.

// ─── Status tones ─────────────────────────────────────────────────────────────

const TONE: Record<DocStatus, { tile: string; text: string; bar: string; icon: React.ElementType }> = {
  verified: {
    tile: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-700 dark:text-emerald-400",
    bar: "bg-emerald-500",
    icon: CheckCircle2,
  },
  pending: {
    tile: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    text: "text-amber-700 dark:text-amber-400",
    bar: "bg-amber-500",
    icon: Clock,
  },
  rejected: {
    tile: "bg-red-500/10 text-red-600 dark:text-red-400",
    text: "text-red-600 dark:text-red-400",
    bar: "bg-red-500",
    icon: XCircle,
  },
  idle: {
    tile: "bg-muted text-muted-foreground",
    text: "text-muted-foreground",
    bar: "bg-muted-foreground/20",
    icon: AlertCircle,
  },
};

const needsUpload = (s: DocStatus) => s === "idle" || s === "rejected";

// ─── Requirements ─────────────────────────────────────────────────────────────

type DocKey = "identity" | "background";

const REQUIREMENTS: Record<DocKey, { name: string; icon: React.ElementType; lines: Record<DocStatus, string> }> = {
  identity: {
    name: "Identidade",
    icon: ShieldCheck,
    lines: {
      verified: "Verificada, válida por 12 meses",
      pending: "Em análise, resposta em até 3 dias úteis",
      rejected: "Recusada, envie de novo",
      idle: "Documento e selfie ainda não enviados",
    },
  },
  background: {
    name: "Antecedentes criminais",
    icon: FileCheck2,
    lines: {
      verified: "Verificados, válidos por 12 meses",
      pending: "Em análise, resposta em até 5 dias úteis",
      rejected: "Certidão recusada, envie de novo",
      idle: "Certidão ainda não enviada",
    },
  },
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

function StatusHero({ identity, background }: { identity: DocStatus; background: DocStatus }) {
  const statuses = [identity, background];
  const missing = statuses.filter(needsUpload).length;

  const hero = statuses.every((s) => s === "verified")
    ? {
        icon: ShieldCheck,
        title: "Perfil ativo",
        text: "Você já pode realizar passeios.",
        box: "border-emerald-500/20 bg-emerald-500/[0.06]",
        tile: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      }
    : statuses.includes("rejected")
      ? {
          icon: XCircle,
          title: "Documento recusado",
          text: "Envie de novo para voltar a realizar passeios.",
          box: "border-red-500/20 bg-red-500/[0.05]",
          tile: "bg-red-500/15 text-red-600 dark:text-red-400",
        }
      : missing > 0
        ? {
            icon: Lock,
            title: `Falta${missing > 1 ? "m" : ""} ${missing} documento${missing > 1 ? "s" : ""}`,
            text: "Envie os obrigatórios para começar a realizar passeios.",
            box: "border-amber-500/20 bg-amber-500/[0.06]",
            tile: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
          }
        : {
            icon: Clock,
            title: "Documentos em análise",
            text: "A DogTravel avisa por e-mail quando terminar.",
            box: "border-amber-500/20 bg-amber-500/[0.06]",
            tile: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
          };

  return (
    <section className={cn("rounded-2xl border p-4", hero.box)}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", hero.tile)}>
          <hero.icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-foreground">{hero.title}</p>
          <p className="text-sm text-muted-foreground">{hero.text}</p>
        </div>
      </div>

      {/* Two-part seal: one segment per requirement, colored by its own status. */}
      <div className="mt-4 grid grid-cols-2 gap-1.5">
        {(["identity", "background"] as const).map((key, i) => (
          <div key={key} className="space-y-1.5">
            <div className={cn("h-1.5 rounded-full", TONE[statuses[i]!].bar)} />
            <p className="text-[11px] font-medium text-muted-foreground">{REQUIREMENTS[key].name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RequirementRow({ docKey, status, onOpen }: { docKey: DocKey; status: DocStatus; onOpen: () => void }) {
  const req = REQUIREMENTS[docKey];
  const tone = TONE[status];

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-muted/50"
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tone.tile)}>
        <req.icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{req.name}</p>
        <p className={cn("mt-0.5 flex items-center gap-1 text-xs font-medium", tone.text)}>
          <tone.icon className="h-3.5 w-3.5 shrink-0" />
          {req.lines[status]}
        </p>
      </div>
      {needsUpload(status) ? (
        <span className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
          {status === "rejected" ? "Reenviar" : "Enviar"}
        </span>
      ) : (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
    </button>
  );
}

// ─── Certificates ─────────────────────────────────────────────────────────────

const CERT_LINES: Record<DocStatus, string> = {
  verified: "Verificada",
  pending: "Em análise",
  rejected: "Recusada",
  idle: "Não enviada",
};

function CertificateRow({
  cert,
  onRemove,
  isRemoving,
}: {
  cert: WalkerCertDocument;
  onRemove: (id: string) => void;
  isRemoving: boolean;
}) {
  const tone = TONE[cert.status];
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tone.tile)}>
        <Award className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold text-foreground">{cert.title}</p>
        <p className={cn("mt-0.5 flex items-center gap-1 text-xs font-medium", tone.text)}>
          <tone.icon className="h-3.5 w-3.5 shrink-0" />
          {CERT_LINES[cert.status]}
        </p>
      </div>
      {cert.status !== "verified" && (
        <button
          type="button"
          aria-label={`Remover ${cert.title}`}
          disabled={isRemoving}
          onClick={() => onRemove(cert.id)}
          className={cn(
            "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors active:bg-destructive/10 active:text-destructive disabled:opacity-50",
            TOUCH_TARGET,
          )}
        >
          {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  identityStatus: DocStatus;
  bgStatus: DocStatus;
  certs: WalkerCertDocument[];
  identity: {
    doc: File | null;
    selfie: File | null;
    setDoc: (f: File | null) => void;
    setSelfie: (f: File | null) => void;
    uploading: boolean;
    submit: () => void;
  };
  background: {
    doc: File | null;
    setDoc: (f: File | null) => void;
    uploading: boolean;
    submit: () => void;
  };
  onAddCert: () => void;
  onRemoveCert: (id: string) => void;
  removingCert: boolean;
}

export function WalkerDocumentsMobile({
  identityStatus,
  bgStatus,
  certs,
  identity,
  background,
  onAddCert,
  onRemoveCert,
  removingCert,
}: Props) {
  const [openDoc, setOpenDoc] = useState<DocKey | null>(null);

  const sheetStatus = openDoc === "background" ? bgStatus : identityStatus;
  const copy = openDoc === "background" ? BACKGROUND_COPY : IDENTITY_COPY;
  const sheetReq = REQUIREMENTS[openDoc ?? "identity"];
  const sheetTone = TONE[sheetStatus];
  const uploading = openDoc === "background" ? background.uploading : identity.uploading;
  const canSubmit =
    openDoc === "background" ? !!background.doc : !!identity.doc && !!identity.selfie;

  return (
    // mb-0: the hidden desktop layout follows, so the page's space-y would add a margin here.
    <div className="mb-0 space-y-6 md:hidden">
      <StatusHero identity={identityStatus} background={bgStatus} />

      <section className="space-y-2">
        <div className="px-1">
          <h2 className="text-base font-semibold text-foreground">Obrigatórios</h2>
          <p className="text-xs text-muted-foreground">Toque para ver detalhes ou enviar.</p>
        </div>
        <Card className="gap-0 divide-y divide-border/60 overflow-hidden py-0">
          <RequirementRow docKey="identity" status={identityStatus} onOpen={() => setOpenDoc("identity")} />
          <RequirementRow docKey="background" status={bgStatus} onOpen={() => setOpenDoc("background")} />
        </Card>
      </section>

      <section className="space-y-2">
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <h2 className="text-base font-semibold text-foreground">Certificações</h2>
            <p className="text-xs text-muted-foreground">Opcionais, mas passam mais confiança aos tutores.</p>
          </div>
          {certs.length > 0 && (
            <Button size="sm" variant="ghost" className="shrink-0 gap-1 text-primary" onClick={onAddCert}>
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          )}
        </div>

        {certs.length > 0 ? (
          <Card className="gap-0 divide-y divide-border/60 overflow-hidden py-0">
            {certs.map((cert) => (
              <CertificateRow key={cert.id} cert={cert} onRemove={onRemoveCert} isRemoving={removingCert} />
            ))}
          </Card>
        ) : (
          <Card className="gap-0 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Mostre o que você sabe</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Cursos de adestramento, primeiros socorros ou veterinária aparecem no seu perfil e
                  dão destaque nas buscas.
                </p>
              </div>
            </div>
            <Button variant="outline" className="mt-4 h-11 w-full gap-1.5 text-sm" onClick={onAddCert}>
              <Plus className="h-4 w-4" />
              Adicionar certificação
            </Button>
          </Card>
        )}
      </section>

      <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Seus documentos são criptografados e usados só para verificar seu perfil. Nunca são
        compartilhados com terceiros.
      </p>

      {/* ── Requirement sheet ─────────────────────────────────────────────── */}
      <Sheet open={openDoc !== null} onOpenChange={(open) => !open && setOpenDoc(null)}>
        <SheetContent side="bottom" className="max-h-[90dvh] gap-0 rounded-t-2xl p-0 md:hidden">
          <SheetHeader className="flex-row items-center gap-3 px-4 pb-3 pt-5 pr-14">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", sheetTone.tile)}>
              <sheetReq.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <SheetTitle>{copy.title}</SheetTitle>
              <SheetDescription>{copy.description}</SheetDescription>
            </div>
          </SheetHeader>

          <div
            className={cn(
              "flex-1 space-y-4 overflow-y-auto overscroll-contain px-4",
              needsUpload(sheetStatus) ? "pb-4" : "pb-[calc(1.5rem+env(safe-area-inset-bottom))]",
            )}
          >
            {sheetStatus === "rejected" && <RejectedBanner message={copy.rejected} />}
            {sheetStatus === "pending" && <PendingBanner message={copy.pending} />}
            {sheetStatus === "verified" && <VerifiedBanner message={copy.verified} />}

            {openDoc === "background" && needsUpload(sheetStatus) && (
              <div className="space-y-1.5 rounded-xl bg-muted/50 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                <p>{BACKGROUND_COPY.why}</p>
                <a
                  href={BACKGROUND_COPY.govUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary"
                >
                  Emitir no portal gov.br
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {openDoc === "identity" && needsUpload(sheetStatus) && (
              <>
                <UploadZone
                  label="Documento oficial"
                  hint={IDENTITY_COPY.docHint}
                  file={identity.doc}
                  onFile={identity.setDoc}
                  disabled={identity.uploading}
                />
                <UploadZone
                  label="Selfie com o documento"
                  hint={IDENTITY_COPY.selfieHint}
                  accept=".jpg,.jpeg,.png"
                  file={identity.selfie}
                  onFile={identity.setSelfie}
                  disabled={identity.uploading}
                />
              </>
            )}

            {openDoc === "background" && needsUpload(sheetStatus) && (
              <UploadZone
                label="Certidão de antecedentes"
                hint={BACKGROUND_COPY.hint}
                file={background.doc}
                onFile={background.setDoc}
                disabled={background.uploading}
              />
            )}
          </div>

          {needsUpload(sheetStatus) && (
            <SheetFooter className="border-t border-border/60 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
              <Button
                className="h-12 w-full gap-2 text-base"
                disabled={!canSubmit || uploading}
                onClick={openDoc === "background" ? background.submit : identity.submit}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {uploading
                  ? "Enviando..."
                  : sheetStatus === "rejected"
                    ? "Reenviar para análise"
                    : "Enviar para análise"}
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
