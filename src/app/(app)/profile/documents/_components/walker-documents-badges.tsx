import { AlertCircle, AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocStatus } from "@/types";

export const STATUS: Record<DocStatus, { label: string; icon: React.ElementType; cls: string }> = {
  idle: {
    label: "Não enviado",
    icon: AlertCircle,
    cls: "bg-muted text-muted-foreground border-border/60",
  },
  pending: {
    label: "Em análise",
    icon: Clock,
    cls: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  },
  verified: {
    label: "Verificado",
    icon: CheckCircle2,
    cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  },
  rejected: {
    label: "Recusado",
    icon: XCircle,
    cls: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
  },
};

export function StatusBadge({ status }: { status: DocStatus }) {
  const { label, cls, icon: Icon } = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", cls)}>
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}

export function RequiredBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
      Obrigatório
    </span>
  );
}

export function OptionalBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
      Opcional
    </span>
  );
}

export function PendingBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3.5">
      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">{message}</p>
    </div>
  );
}

export function VerifiedBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3.5">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <p className="text-xs leading-relaxed text-emerald-700 dark:text-emerald-300">{message}</p>
    </div>
  );
}

export function RejectedBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
      <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">{message}</p>
    </div>
  );
}

export function DocCardHeader({
  icon: Icon, iconBg, iconColor, barClass, title, description, status, required,
}: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  barClass: string; title: string; description: string;
  status: DocStatus; required: boolean;
}) {
  return (
    <>
      <div className={cn("h-1 w-full bg-gradient-to-r", barClass)} />
      <CardHeader className="pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", iconBg)}>
              <Icon className={cn("h-4 w-4", iconColor)} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                {required ? <RequiredBadge /> : <OptionalBadge />}
              </div>
              <CardDescription className="mt-0.5 text-xs">{description}</CardDescription>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
    </>
  );
}
