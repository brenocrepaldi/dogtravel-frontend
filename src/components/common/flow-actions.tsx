"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FlowActionsProps {
  showBack?: boolean;
  backLabel?: string;
  backHref?: string;
  onBack?: () => void;
  cancelLabel?: string;
  cancelHref?: string;
  onCancel?: () => void;
  primaryLabel: string;
  primaryHref?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  primaryVariant?: "default" | "success" | "secondary";
  primaryIcon?: React.ReactNode;
  className?: string;
}

/**
 * Shared actions footer used in multi-step flows to keep Back, Cancel and Complete consistent.
 */
export function FlowActions({
  showBack = true,
  backLabel = "Voltar",
  backHref,
  onBack,
  cancelLabel = "Cancelar",
  cancelHref,
  onCancel,
  primaryLabel,
  primaryHref,
  onPrimary,
  primaryDisabled,
  primaryLoading,
  primaryVariant = "default",
  primaryIcon,
  className,
}: FlowActionsProps) {
  const hasCancel = Boolean(cancelHref ?? onCancel);
  // With Back + Cancel + primary, both secondaries collapse to icons on mobile
  // so the primary label still fits on a 360px screen.
  const compactSecondaries = showBack && hasCancel;

  // Mobile: one thumb-height row — secondary actions sized to their content on
  // the left, the primary filling the rest on the right (forward = right).
  // From sm up the original layout is kept untouched.
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-border/70 pt-5 sm:justify-between",
        className
      )}
    >
      <div className="flex shrink-0 items-center gap-2 sm:flex-wrap">
        {showBack && (
          <FlowButton
            variant="ghost"
            label={backLabel}
            icon={<ArrowLeft className="h-4 w-4" />}
            href={backHref}
            onClick={onBack}
            iconOnlyOnMobile={compactSecondaries}
            className="max-sm:border-border max-sm:bg-background"
          />
        )}

        {hasCancel && (
          <FlowButton
            variant="outline"
            label={cancelLabel}
            icon={<X className="h-4 w-4" />}
            href={cancelHref}
            onClick={onCancel}
            iconOnlyOnMobile={compactSecondaries}
          />
        )}
      </div>

      <FlowButton
        variant={primaryVariant}
        label={primaryLoading ? "Concluindo..." : primaryLabel}
        icon={primaryIcon ?? <CheckCircle2 className="h-4 w-4" />}
        href={primaryHref}
        onClick={onPrimary}
        disabled={primaryDisabled || primaryLoading}
        className="min-w-0 flex-1 sm:flex-none"
      />
    </div>
  );
}

interface FlowButtonProps {
  variant: "default" | "ghost" | "outline" | "success" | "secondary";
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Show only the icon below sm (label stays for screen readers). */
  iconOnlyOnMobile?: boolean;
  className?: string;
}

function FlowButton({
  variant,
  label,
  icon,
  href,
  onClick,
  disabled,
  iconOnlyOnMobile,
  className,
}: FlowButtonProps) {
  const classes = cn(
    "max-sm:h-12 max-sm:px-4",
    iconOnlyOnMobile && "max-sm:w-12 max-sm:px-0",
    className
  );
  const content = (
    <>
      {icon}
      <span className={iconOnlyOnMobile ? "max-sm:sr-only" : "truncate"}>{label}</span>
    </>
  );

  if (href) {
    return (
      <Button variant={variant} render={<Link href={href} />} disabled={disabled} className={classes}>
        {content}
      </Button>
    );
  }

  return (
    <Button variant={variant} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </Button>
  );
}
