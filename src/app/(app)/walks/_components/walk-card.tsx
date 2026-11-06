'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { WalkRecord } from '@/types';
import { AlertCircle, CalendarDays, Clock, Dog, MapPin, Star, X } from 'lucide-react';

// ── Status config ──────────────────────────────────────────────────────────
const statusMap: Record<WalkRecord['status'], { label: string; dot: string; pill: string }> = {
	pending: {
		label: 'Procurando',
		dot: 'bg-amber-400',
		pill: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
	},
	accepted: {
		label: 'Agendado',
		dot: 'bg-blue-400',
		pill: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
	},
	in_progress: {
		label: 'Em andamento',
		dot: 'bg-emerald-400 animate-pulse',
		pill: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
	},
	completed: {
		label: 'Concluído',
		dot: 'bg-slate-400',
		pill: 'bg-secondary/60 text-muted-foreground border-border/60',
	},
	cancelled: {
		label: 'Cancelado',
		dot: 'bg-red-400',
		pill: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
	},
};

function StatusPill({ status }: { status: WalkRecord['status'] }) {
	const cfg = statusMap[status];
	return (
		<span
			className={cn(
				'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide shrink-0',
				cfg.pill,
			)}
		>
			{status === 'pending' ? (
				<span className="relative flex w-1.5 h-1.5 shrink-0">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
					<span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-amber-400" />
				</span>
			) : (
				<span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
			)}
			{cfg.label}
		</span>
	);
}

function PetBadge({ name }: { name: string }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary tracking-wide">
			<Dog className="w-3 h-3 shrink-0" />
			<span className="truncate max-w-[6rem]">{name}</span>
		</span>
	);
}

export function WalkCard({
	walk,
	onCancel,
}: {
	walk: WalkRecord;
	onCancel: (id: string) => void;
}) {
	const isSearching = walk.status === 'pending';
	const isActive    = walk.status === 'in_progress';
	const isCompleted = walk.status === 'completed';
	const isPending   = walk.status === 'accepted';
	const isCancelled = walk.status === 'cancelled';

	const [confirmingCancel, setConfirmingCancel] = useState(false);

	const walkerName = walk.participants.find((p) => p.role === 'walker')?.name ?? 'Passeador';
	const hasReview = walk.hasReview ?? false;

	const walkerInitials = walkerName
		.split(' ')
		.map((n) => n[0])
		.slice(0, 2)
		.join('')
		.toUpperCase();

	return (
		<div
			className={cn(
				'group relative rounded-2xl border bg-card overflow-hidden flex flex-col transition-all duration-300',
				'hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20',
				isActive
					? 'border-emerald-500/60 shadow-sm shadow-emerald-500/10'
					: isSearching
						? 'border-amber-500/60 shadow-sm shadow-amber-500/10'
						: 'border-border/60 hover:border-border',
			)}
		>
			{isActive && (
				<div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />
			)}
			{isSearching && (
				<div className="h-1 w-full bg-gradient-to-r from-amber-400/60 via-amber-500 to-amber-400/60" />
			)}

			{/* Header */}
			<div className="px-4 pt-4 pb-3 md:px-5 md:pt-5 md:pb-4 flex items-start justify-between gap-3">
				{isSearching ? (
					<div className="flex items-center gap-3 min-w-0">
						<div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-amber-500/10 ring-1 ring-amber-500/20">
							<CalendarDays className="w-4 h-4 text-amber-600 dark:text-amber-400" />
						</div>
						<div className="min-w-0">
							<p className="text-sm font-semibold text-foreground leading-tight">Procurando passeador</p>
							<div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground md:text-[11px] md:leading-normal">
								<CalendarDays className="w-3 h-3 shrink-0" />
								<span className="truncate">{walk.dateLabel}</span>
							</div>
						</div>
					</div>
				) : (
					<div className="flex items-start gap-3 min-w-0">
						{walk.walkerAvatarUrl ? (
							<div className="relative w-10 h-10 rounded-2xl shrink-0 ring-1 ring-border/30 overflow-hidden">
								<Image src={walk.walkerAvatarUrl} alt={walkerName} fill sizes="40px" className="object-cover" />
							</div>
						) : (
							<div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold ring-1 bg-primary/8 text-primary ring-primary/15">
								{walkerInitials}
							</div>
						)}
						<div className="min-w-0">
							<p className="text-sm font-semibold text-foreground leading-tight truncate">
								{walkerName}
							</p>
							<div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground md:text-[11px] md:leading-normal">
								<CalendarDays className="w-3 h-3 shrink-0" />
								<span className="truncate">{walk.dateLabel}</span>
							</div>
						</div>
					</div>
				)}
				{isSearching ? (
					<span className="relative flex w-2.5 h-2.5 shrink-0 mt-1">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
						<span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-amber-400" />
					</span>
				) : (
					<StatusPill status={walk.status} />
				)}
			</div>

			<Separator className="opacity-50" />

			{/* Info */}
			<div className="px-4 py-3 flex-1 space-y-2.5 md:px-5 md:py-4 md:space-y-3">
				<div className="flex items-center justify-between gap-2">
					<div className="flex flex-wrap items-center gap-1.5 min-w-0">
						{walk.petNames.map((name, i) => (
							<PetBadge key={`${name}-${i}`} name={name} />
						))}
					</div>
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 md:text-[11px] md:leading-normal">
						<Clock className="w-3 h-3" />
						{walk.durationMinutes} min
					</div>
				</div>

				<div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
					<MapPin className="w-3.5 h-3.5 shrink-0" />
					<span className="truncate" title={walk.startAddress}>
						{walk.startAddress}
					</span>
				</div>

				<div className="flex items-center justify-between">
					<span className="text-lg font-bold text-foreground tabular-nums">
						{walk.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
					</span>
					{isCompleted && hasReview && (
						<div className="flex items-center gap-0.5">
							{[1, 2, 3, 4, 5].map((star) => (
								<Star key={star} className="w-3 h-3 text-amber-400 fill-amber-400" />
							))}
						</div>
					)}
					{isCompleted && !hasReview && (
						<span className="text-xs text-muted-foreground md:text-[11px] md:leading-normal">Sem avaliação</span>
					)}
				</div>
			</div>

			{/* Actions */}
			<div className="px-4 pb-4 md:px-5 md:pb-5">
				{isActive && (
					<div className="grid grid-cols-2 gap-2">
						<Link
							href={`/walks/${walk.id}`}
							className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 md:h-9 rounded-lg w-full')}
						>
							Detalhes
						</Link>
						<Link
							href={`/walks/${walk.id}/tracking`}
							className={cn(
								buttonVariants({ size: 'lg' }),
								'h-11 md:h-9 rounded-lg gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border-0',
							)}
						>
							<MapPin className="w-3.5 h-3.5" />
							Acompanhar
						</Link>
					</div>
				)}

				{isSearching && !confirmingCancel && (
					<button
						type="button"
						onClick={() => setConfirmingCancel(true)}
						className={cn(
							buttonVariants({ variant: 'outline', size: 'lg' }),
							'h-11 md:h-9 rounded-lg w-full gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive/50 cursor-pointer',
						)}
					>
						<X className="w-3.5 h-3.5" />
						Cancelar busca
					</button>
				)}

				{isPending && !confirmingCancel && (
					<div className="grid grid-cols-2 gap-2">
						<Link
							href={`/walks/${walk.id}`}
							className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 md:h-9 rounded-lg w-full')}
						>
							Detalhes
						</Link>
						<button
							type="button"
							onClick={() => setConfirmingCancel(true)}
							className={cn(
								buttonVariants({ variant: 'outline', size: 'lg' }),
								'h-11 md:h-9 rounded-lg w-full gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive/50 cursor-pointer',
							)}
						>
							<X className="w-3.5 h-3.5" />
							Cancelar
						</button>
					</div>
				)}

				{(isSearching || isPending) && confirmingCancel && (
					<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-2.5">
						<div className="flex items-center gap-2 text-sm text-destructive">
							<AlertCircle className="w-4 h-4 shrink-0" />
							<span className="font-medium">Cancelar este passeio?</span>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<button
								type="button"
								onClick={() => setConfirmingCancel(false)}
								className={cn(
									buttonVariants({ variant: 'outline', size: 'sm' }),
									'h-11 md:h-7 rounded-lg cursor-pointer',
								)}
							>
								Voltar
							</button>
							<button
								type="button"
								onClick={() => onCancel(walk.id)}
								className={cn(
									buttonVariants({ variant: 'destructive', size: 'sm' }),
									'h-11 md:h-7 rounded-lg cursor-pointer',
								)}
							>
								Sim, cancelar
							</button>
						</div>
					</div>
				)}

				{isCompleted && (
					<div className="grid grid-cols-2 gap-2">
						<Link
							href={`/walks/${walk.id}`}
							className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 md:h-9 rounded-lg w-full')}
						>
							Detalhes
						</Link>
						{hasReview ? (
							<Link
								href={`/walks/${walk.id}/review`}
								className={cn(
									buttonVariants({ variant: 'outline', size: 'lg' }),
									'h-11 md:h-9 rounded-lg w-full gap-1.5',
								)}
							>
								<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
								Ver avaliação
							</Link>
						) : (
							<Link
								href={`/walks/${walk.id}/review`}
								className={cn(
									buttonVariants({ variant: 'outline', size: 'lg' }),
									'h-11 md:h-9 rounded-lg w-full gap-1.5 bg-amber-400 hover:bg-amber-300 border-0 text-white hover:text-white',
								)}
							>
								<Star className="w-3.5 h-3.5 fill-white text-white" />
								Avaliar
							</Link>
						)}
					</div>
				)}

				{isCancelled && (
					<div className="grid grid-cols-2 gap-2">
						<Link
							href={`/walks/${walk.id}`}
							className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 md:h-9 rounded-lg w-full')}
						>
							Detalhes
						</Link>
						<Link
							href={walk.walkerId ? `/walks/new?walker=${walk.walkerId}` : '/walks/new'}
							className={cn(
								buttonVariants({ variant: 'secondary', size: 'lg' }),
								'h-11 md:h-9 rounded-lg w-full',
							)}
						>
							Repetir passeio
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
