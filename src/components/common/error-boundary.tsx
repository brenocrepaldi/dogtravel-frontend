'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
	error: Error & { digest?: string };
	reset: () => void;
	backHref?: string;
	backLabel?: string;
}

export function ErrorBoundary({
	error,
	reset,
	backHref = '/dashboard',
	backLabel = 'Ir ao início',
}: ErrorBoundaryProps) {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center px-4">
			<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
				<AlertTriangle className="h-7 w-7 text-destructive" />
			</div>

			<div className="space-y-1 max-w-sm">
				<h2 className="text-lg font-semibold tracking-tight">Algo deu errado</h2>
				<p className="text-sm text-muted-foreground">
					{error.message ?? 'Ocorreu um erro inesperado. Tente novamente.'}
				</p>
				{error.digest && (
					<p className="text-xs text-muted-foreground/60 font-mono mt-2">Ref: {error.digest}</p>
				)}
			</div>

			<div className="flex items-center gap-3">
				<Button variant="outline" onClick={reset}>
					Tentar novamente
				</Button>
				<Button render={<Link href={backHref} />}>{backLabel}</Button>
			</div>
		</div>
	);
}
