"use client";

import { useParams } from "next/navigation";
import { ErrorBoundary } from "@/components/common/error-boundary";

export default function TrackingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { id } = useParams<{ id: string }>();

  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      backHref={`/walks/${id}`}
      backLabel="Voltar ao passeio"
    />
  );
}
