import { Award, FileText, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOUCH_TARGET } from "@/components/ui/button";
import type { WalkerCertDocument } from "@/types";
import { StatusBadge } from "./walker-documents-badges";

export function CertRow({ cert, onRemove, isRemoving }: {
  cert: WalkerCertDocument;
  onRemove: (id: string) => void;
  isRemoving: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3.5 transition-colors hover:bg-accent/20">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Award className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{cert.title}</p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
          <FileText className="h-3 w-3 shrink-0" />
          {cert.fileName}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={cert.status} />
        {cert.status !== "verified" && (
          <button
            type="button"
            aria-label={`Remover ${cert.title}`}
            disabled={isRemoving}
            onClick={() => onRemove(cert.id)}
            className={cn(
              "relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50",
              TOUCH_TARGET,
            )}
          >
            {isRemoving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
