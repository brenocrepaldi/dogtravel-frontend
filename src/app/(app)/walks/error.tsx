'use client';

import { ErrorBoundary } from '@/components/common/error-boundary';

export default function WalksError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<ErrorBoundary error={error} reset={reset} backHref="/dashboard" backLabel="Ir ao início" />
	);
}
