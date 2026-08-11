import { useId, useRef } from "react";
import { FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadZone({
  label,
  hint,
  file,
  onFile,
  disabled = false,
  accept = ".pdf,.jpg,.jpeg,.png",
}: {
  label: string;
  hint: string;
  file: File | null;
  onFile: (f: File | null) => void;
  disabled?: boolean;
  accept?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const inputId = useId();

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <input
        ref={ref}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => { onFile(e.target.files?.[0] ?? null); e.target.value = ""; }}
      />
      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/[0.03] px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {file.size < 1024 * 1024
                ? `${(file.size / 1024).toFixed(0)} KB`
                : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
            </p>
          </div>
          {!disabled && (
            <button
              type="button"
              aria-label="Remover arquivo"
              onClick={() => onFile(null)}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => ref.current?.click()}
          className={cn(
            "flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all",
            disabled
              ? "cursor-not-allowed border-border/30 opacity-50"
              : "cursor-pointer border-border/60 hover:border-primary/40 hover:bg-primary/[0.02]",
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Selecionar arquivo</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
          </div>
        </button>
      )}
    </div>
  );
}
