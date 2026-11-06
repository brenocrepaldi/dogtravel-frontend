"use client";

import { ErrorBoundary } from "@/components/common/error-boundary";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      backHref="/"
      backLabel="Voltar ao início"
    />
  );
}
