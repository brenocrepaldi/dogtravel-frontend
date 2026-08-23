import { AlertCircle, CheckCircle2, Clock, Lock, ShieldCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DocStatus } from "@/types";
import { StatusBadge } from "./walker-documents-badges";

function ChecklistItem({ label, status }: { label: string; status: DocStatus }) {
  const Icon =
    status === "verified" ? CheckCircle2
    : status === "pending" ? Clock
    : status === "rejected" ? XCircle
    : AlertCircle;

  const iconCls =
    status === "verified" ? "text-emerald-600 dark:text-emerald-400"
    : status === "pending" ? "text-amber-600 dark:text-amber-400"
    : status === "rejected" ? "text-red-600 dark:text-red-400"
    : "text-muted-foreground";

  return (
    <div className="flex items-center gap-3">
      <Icon className={cn("h-4 w-4 shrink-0", iconCls)} />
      <span className="flex-1 text-xs text-foreground">{label}</span>
      <StatusBadge status={status} />
    </div>
  );
}

export function OnboardingProgressCard({
  identityStatus,
  bgStatus,
}: {
  identityStatus: DocStatus;
  bgStatus: DocStatus;
}) {
  const requiredCompleted = [identityStatus, bgStatus].filter((s) => s === "verified").length;
  const canAcceptWalks = requiredCompleted === 2;
  const progress = (requiredCompleted / 2) * 100;

  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div
        className={cn("h-1.5 w-full bg-gradient-to-r",
          canAcceptWalks
            ? "from-emerald-400/60 via-emerald-500 to-emerald-400/40"
            : "from-amber-400/60 via-amber-500 to-amber-400/40",
        )}
      />
      <CardContent className="space-y-4 py-5">
        <div className="flex items-start gap-3">
          <div
            className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              canAcceptWalks ? "bg-emerald-500/10" : "bg-amber-500/10",
            )}
          >
            {canAcceptWalks ? (
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {canAcceptWalks
                ? "Perfil ativo — você pode realizar passeios"
                : "Conclua os requisitos para realizar passeios"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {canAcceptWalks
                ? "Todos os documentos obrigatórios foram aprovados pela DogTravel."
                : `${requiredCompleted} de 2 requisitos obrigatórios aprovados`}
            </p>
          </div>
          <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
            {requiredCompleted}/2
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all duration-700",
              canAcceptWalks ? "bg-emerald-500" : progress > 0 ? "bg-amber-500" : "bg-muted-foreground/30",
            )}
            style={{ width: `${Math.max(progress, progress > 0 ? 4 : 0)}%` }}
          />
        </div>

        <Separator />

        <div className="space-y-2.5">
          <ChecklistItem label="Verificação de identidade" status={identityStatus} />
          <ChecklistItem label="Antecedentes criminais" status={bgStatus} />
        </div>
      </CardContent>
    </Card>
  );
}
