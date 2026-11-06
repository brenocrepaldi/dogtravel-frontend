'use client';

import { ErrorBoundary } from '@/components/common/error-boundary';

export default function WalkerDetailError({
	error,
	retry,
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	// `retry` re-fetches the server segment (the walker is loaded server-side), unlike `reset`
	return <ErrorBoundary error={error} reset={retry} backHref="/walkers" backLabel="Ver passeadores" />;
}
