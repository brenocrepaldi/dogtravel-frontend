"use client";

import { useState } from "react";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  Loader2,
  Plus,
  ShieldCheck,
  Star,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocStatus } from "@/types";
import {
  useDocuments,
  useUploadIdentity,
  useUploadBackground,
  useAddCertificate,
  useRemoveCertificate,
} from "@/features/documents/hooks/use-documents";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DocCardHeader,
  OptionalBadge,
  PendingBanner,
  RejectedBanner,
  VerifiedBanner,
} from "./walker-documents-badges";
import { UploadZone } from "./walker-documents-upload-zone";
import { OnboardingProgressCard } from "./walker-documents-progress-card";
import { CertRow } from "./walker-documents-cert-row";

// ─── Main component ─────────────────────────────────────────────────────────

const CERT_SUGGESTIONS = [
  "Adestramento",
  "Primeiros Socorros",
  "Veterinária",
];

export function WalkerDocuments() {
  const { data: docStatus, isLoading } = useDocuments();
  const { mutate: uploadIdentity, isPending: uploadingIdentity } = useUploadIdentity();
  const { mutate: uploadBackground, isPending: uploadingBackground } = useUploadBackground();
  const { mutate: addCert, isPending: addingCert } = useAddCertificate();
  const { mutate: removeCert, isPending: removingCert } = useRemoveCertificate();

  const [identityDoc, setIdentityDoc] = useState<File | null>(null);
  const [identitySelfie, setIdentitySelfie] = useState<File | null>(null);
  const [bgDoc, setBgDoc] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [certTitle, setCertTitle] = useState("");
  const [certFile, setCertFile] = useState<File | null>(null);

  const identityStatus = docStatus?.identity ?? "idle";
  const bgStatus = docStatus?.background ?? "idle";
  const certs = docStatus?.certificates ?? [];

  const needsUpload = (s: DocStatus) => s === "idle" || s === "rejected";

  function submitIdentity() {
    if (!identityDoc || !identitySelfie) return;
    uploadIdentity(
      { doc: identityDoc, selfie: identitySelfie },
      {
        onSuccess: () => {
          setIdentityDoc(null);
          setIdentitySelfie(null);
          toast.success("Documentos enviados!", { description: "Verificação em até 3 dias úteis." });
        },
        onError: () => toast.error("Erro ao enviar documentos. Tente novamente."),
      }
    );
  }

  function submitBackground() {
    if (!bgDoc) return;
    uploadBackground(bgDoc, {
      onSuccess: () => {
        setBgDoc(null);
        toast.success("Certidão enviada!", { description: "Verificação em até 5 dias úteis." });
      },
      onError: () => toast.error("Erro ao enviar certidão. Tente novamente."),
    });
  }

  function handleAddCert() {
    if (!certTitle.trim() || !certFile) return;
    addCert(
      { title: certTitle.trim(), file: certFile },
      {
        onSuccess: () => {
          setCertTitle("");
          setCertFile(null);
          setDialogOpen(false);
          toast.success("Certificação adicionada!", { description: "Aguardando verificação da equipe DogTravel." });
        },
        onError: () => toast.error("Erro ao adicionar certificação."),
      }
    );
  }

  function handleRemoveCert(id: string) {
    removeCert(id, {
      onSuccess: () => toast("Certificação removida."),
      onError: () => toast.error("Erro ao remover certificação."),
    });
  }

  function closeCertDialog() {
    setDialogOpen(false);
    setCertTitle("");
    setCertFile(null);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">

        {/* ── Progresso do onboarding ──────────────────────────────────────── */}
        <OnboardingProgressCard identityStatus={identityStatus} bgStatus={bgStatus} />

        {/* ── Verificação de identidade — OBRIGATÓRIO ──────────────────────── */}
        <Card className="overflow-hidden py-0 gap-0">
          <DocCardHeader
            icon={ShieldCheck}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-600 dark:text-emerald-400"
            barClass="from-emerald-400/60 via-emerald-500 to-emerald-400/40"
            title="Verificação de Identidade"
            description="Documento oficial + selfie segurando o documento"
            status={identityStatus}
            required
          />
          <Separator />
          <CardContent className="space-y-5 py-5">
            {identityStatus === "rejected" && (
              <RejectedBanner message="Seus documentos foram recusados. Verifique se a foto está nítida, o documento está visível e dentro da validade, e reenvie para nova análise." />
            )}
            {needsUpload(identityStatus) && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <UploadZone
                    label="Documento oficial"
                    hint="RG, CNH ou passaporte · PDF ou imagem · máx. 5 MB"
                    file={identityDoc}
                    onFile={setIdentityDoc}
                    disabled={uploadingIdentity}
                  />
                  <UploadZone
                    label="Selfie com o documento"
                    hint="Foto segurando o documento aberto · JPG ou PNG · máx. 5 MB"
                    accept=".jpg,.jpeg,.png"
                    file={identitySelfie}
                    onFile={setIdentitySelfie}
                    disabled={uploadingIdentity}
                  />
                </div>
                <Button
                  size="sm"
                  className="rounded-lg gap-1.5 shadow-sm"
                  disabled={!identityDoc || !identitySelfie || uploadingIdentity}
                  onClick={submitIdentity}
                >
                  {uploadingIdentity ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  {uploadingIdentity ? "Enviando..." : identityStatus === "rejected" ? "Reenviar para análise" : "Enviar para análise"}
                </Button>
              </>
            )}
            {identityStatus === "pending" && (
              <PendingBanner message="Seus documentos foram recebidos e estão em análise. A verificação é realizada em até 3 dias úteis. Você será notificado por e-mail quando concluída." />
            )}
            {identityStatus === "verified" && (
              <VerifiedBanner message="Identidade verificada e aprovada pela DogTravel. Suas informações estão protegidas e a verificação é válida por 12 meses." />
            )}
          </CardContent>
        </Card>

        {/* ── Antecedentes criminais — OBRIGATÓRIO ─────────────────────────── */}
        <Card className="overflow-hidden py-0 gap-0">
          <DocCardHeader
            icon={FileCheck2}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-600 dark:text-blue-400"
            barClass="from-blue-400/60 via-blue-500 to-blue-400/40"
            title="Antecedentes Criminais"
            description="Certidão emitida nos últimos 90 dias"
            status={bgStatus}
            required
          />
          <Separator />
          <CardContent className="space-y-5 py-5">
            <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3.5">
              <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                <p>
                  Exigida para garantir a segurança de tutores e pets em todos os passeios. Pode ser emitida gratuitamente pelo portal do governo federal e deve ter sido emitida nos últimos 90 dias.
                </p>
                <a
                  href="https://www.gov.br/pt-br/servicos/emitir-certidao-de-antecedentes-criminais"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  Emitir no portal gov.br
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            {bgStatus === "rejected" && (
              <RejectedBanner message="Sua certidão foi recusada. Verifique se é uma certidão de antecedentes criminais válida, emitida nos últimos 90 dias, e reenvie para nova análise." />
            )}
            {needsUpload(bgStatus) && (
              <>
                <UploadZone
                  label="Certidão de antecedentes"
                  hint="PDF ou imagem · emitida nos últimos 90 dias · máx. 5 MB"
                  file={bgDoc}
                  onFile={setBgDoc}
                  disabled={uploadingBackground}
                />
                <Button
                  size="sm"
                  className="rounded-lg gap-1.5 shadow-sm"
                  disabled={!bgDoc || uploadingBackground}
                  onClick={submitBackground}
                >
                  {uploadingBackground ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  {uploadingBackground ? "Enviando..." : bgStatus === "rejected" ? "Reenviar para análise" : "Enviar para análise"}
                </Button>
              </>
            )}
            {bgStatus === "pending" && (
              <PendingBanner message="Certidão recebida e em análise pela equipe DogTravel. A verificação é realizada em até 5 dias úteis. Você será notificado por e-mail quando concluída." />
            )}
            {bgStatus === "verified" && (
              <VerifiedBanner message="Antecedentes criminais verificados e aprovados. A checagem é válida por 12 meses a partir da data de emissão do documento." />
            )}
          </CardContent>
        </Card>

        {/* ── Certificações e credenciais — OPCIONAL ───────────────────────── */}
        <Card className="overflow-hidden py-0 gap-0">
          <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
          <CardHeader className="pb-4 pt-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-sm font-semibold">Certificações e Credenciais</CardTitle>
                    <OptionalBadge />
                  </div>
                  <CardDescription className="mt-0.5 text-xs">Cursos, formações e experiências profissionais com pets</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="outline" className="rounded-lg gap-1.5 shrink-0" onClick={() => setDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-5 py-5">
            <div className="rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-4 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs font-semibold text-foreground">Por que adicionar certificações?</p>
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Star className="h-3 w-3 shrink-0 text-primary" />
                  Perfis com credenciais transmitem muito mais confiança aos tutores
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-3 w-3 shrink-0 text-primary" />
                  Destaque especial nos resultados de busca da plataforma
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-3 w-3 shrink-0 text-primary" />
                  Maior credibilidade para conseguir mais passeios
                </li>
              </ul>
              <div className="pt-0.5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Exemplos aceitos</p>
                <div className="flex flex-wrap gap-1.5">
                  {CERT_SUGGESTIONS.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-border/60 bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {certs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Award className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Nenhuma certificação adicionada</p>
                  <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">
                    Adicione cursos e formações para fortalecer seu perfil e conquistar a confiança dos tutores.
                  </p>
                </div>
                <Button size="sm" variant="outline" className="mt-1 rounded-lg gap-1.5" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar certificação
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {certs.map((cert) => (
                  <CertRow
                    key={cert.id}
                    cert={cert}
                    onRemove={handleRemoveCert}
                    isRemoving={removingCert}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Seus documentos estão seguros</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Todos os documentos são armazenados com criptografia de ponta a ponta. As informações são utilizadas exclusivamente para verificação do perfil profissional e nunca são compartilhadas com terceiros.
            </p>
          </div>
        </div>

      </div>

      {/* ── Dialog: adicionar certificação ─────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <Award className="h-4 w-4 text-primary" />
              </div>
              Adicionar certificação
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-1">
            <div className="space-y-2">
              <Label
                htmlFor="cert-title"
                className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Nome da certificação
              </Label>
              <Input
                id="cert-title"
                placeholder="Ex: Adestramento Positivo"
                value={certTitle}
                onChange={(e) => setCertTitle(e.target.value)}
                className="rounded-lg"
                onKeyDown={(e) => { if (e.key === "Enter") handleAddCert(); }}
              />
            </div>

            <UploadZone
              label="Arquivo do certificado"
              hint="PDF ou imagem · máx. 5 MB"
              file={certFile}
              onFile={setCertFile}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" size="sm" className="rounded-lg" onClick={closeCertDialog}>
              Cancelar
            </Button>
            <Button
              size="sm"
              className="rounded-lg gap-1.5 shadow-sm"
              disabled={!certTitle.trim() || !certFile || addingCert}
              onClick={handleAddCert}
            >
              {addingCert ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              {addingCert ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
