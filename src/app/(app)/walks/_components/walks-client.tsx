'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { buttonVariants, TOUCH_TARGET } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useWalks } from '@/features/walks/hooks/use-walks';
import { useCancelWalk } from '@/features/walks/hooks/use-walk-actions';
import { cn } from '@/lib/utils';
import type { WalkRecord } from '@/types';
import { Plus, Search } from 'lucide-react';
import { WalkCard } from './walk-card';

// ── Sort order ─────────────────────────────────────────────────────────────
function walkPriority(w: WalkRecord): number {
	if (w.status === 'pending')   return 0;
	if (w.status === 'in_progress') return 1;
	if (w.status === 'accepted')  return 2;
	if (w.status === 'completed') return 3;
	return 4; // cancelled
}

function sortWalks(walks: WalkRecord[]): WalkRecord[] {
	return [...walks].sort((a, b) => {
		const pDiff = walkPriority(a) - walkPriority(b);
		if (pDiff !== 0) return pDiff;
		return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
	});
}

// ── Empty state ────────────────────────────────────────────────────────────
function WalksEmptyState({ filtered = false }: { filtered?: boolean }) {
	return (
		<div className="flex flex-col items-center justify-center py-20 px-6 text-center col-span-full">
			<div className="relative mb-5">
				<div className="w-20 h-20 rounded-3xl bg-primary/5 ring-1 ring-primary/10 flex items-center justify-center text-4xl">
					🐾
				</div>
				{!filtered && (
					<div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
						<Plus className="w-4 h-4 text-primary-foreground" />
					</div>
				)}
			</div>
			<h3 className="text-base font-semibold text-foreground mb-1.5">
				{filtered ? 'Nenhum passeio encontrado' : 'Você ainda não tem passeios'}
			</h3>
			<p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">
				{filtered
					? 'Tente mudar o filtro ou a busca para encontrar outros passeios.'
					: 'Solicite seu primeiro passeio e acompanhe tudo por aqui.'}
			</p>
			{!filtered && (
				<Link
					href="/walks/new"
					className={cn(buttonVariants({ size: 'default' }), 'rounded-lg gap-2')}
				>
					<Plus className="w-4 h-4" />
					Solicitar passeio
				</Link>
			)}
		</div>
	);
}

// ── Filters ────────────────────────────────────────────────────────────────
type FilterValue = 'todos' | 'pendentes' | 'em_andamento' | 'concluidos' | 'cancelados';

const FILTERS: { value: FilterValue; label: string; match: (w: WalkRecord) => boolean }[] = [
	{ value: 'todos',        label: 'Todos',        match: () => true },
	{ value: 'pendentes',    label: 'Agendados',    match: (w) => w.status === 'accepted' || w.status === 'pending' },
	{ value: 'em_andamento', label: 'Em andamento', match: (w) => w.status === 'in_progress' },
	{ value: 'concluidos',   label: 'Concluídos',   match: (w) => w.status === 'completed' },
	{ value: 'cancelados',   label: 'Cancelados',   match: (w) => w.status === 'cancelled' },
];

// ── Main client component ──────────────────────────────────────────────────
export function WalksClient() {
	const { data: rawWalks = [], isLoading } = useWalks('client');
	const { mutate: cancelWalk } = useCancelWalk();
	const [activeFilter, setActiveFilter] = useState<FilterValue>('todos');
	const [search, setSearch] = useState('');

	const allWalks = useMemo(() => sortWalks(rawWalks), [rawWalks]);

	const filtered = useMemo(() => {
		const filterFn = FILTERS.find((f) => f.value === activeFilter)?.match ?? (() => true);
		const byStatus = allWalks.filter(filterFn);
		if (!search.trim()) return byStatus;
		const q = search.toLowerCase();
		return byStatus.filter(
			(w) =>
				w.petNames.some((n) => n.toLowerCase().includes(q)) ||
				(w.participants.find((p) => p.role === 'walker')?.name ?? '').toLowerCase().includes(q) ||
				w.startAddress.toLowerCase().includes(q),
		);
	}, [allWalks, activeFilter, search]);

	const counts = useMemo(
		() => Object.fromEntries(FILTERS.map((f) => [f.value, allWalks.filter(f.match).length])),
		[allWalks],
	);

	function handleCancel(id: string) {
		cancelWalk(id, {
			onSuccess: () => toast.success('Passeio cancelado.'),
		});
	}

	if (isLoading) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-8">
				{[1, 2, 3].map((i) => (
					<div key={i} className="rounded-2xl border bg-card h-64 animate-pulse" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-5 pb-8 md:space-y-8">
			{/* Header */}
			<div className="space-y-1.5">
				<div className="flex items-center justify-between gap-3 md:flex-wrap md:items-start md:gap-4">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
							Meus Passeios
						</h1>
						<p className="hidden text-sm text-muted-foreground md:block">
							Histórico e acompanhamento de todos os passeios.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Link
							href="/walks/new"
							className={cn(buttonVariants({ variant: 'default' }), 'h-11 shrink-0 gap-1.5 shadow-sm rounded-lg md:h-10')}
						>
							<Plus className="w-3.5 h-3.5" />
							Novo passeio
						</Link>
					</div>
				</div>
				<Separator className="mt-6 hidden md:block" />
			</div>

			{/* Filters + search */}
			<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 md:gap-4">
				<div className="-mx-4 flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:py-0">
					{FILTERS.map((f) => {
						const count    = counts[f.value] ?? 0;
						const isActive = activeFilter === f.value;
						return (
							<button
								key={f.value}
								type="button"
								onClick={() => setActiveFilter(f.value)}
								aria-pressed={isActive}
								className={cn(
									'relative inline-flex h-9 shrink-0 items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer border md:h-auto',
									TOUCH_TARGET,
									isActive
										? 'bg-primary text-primary-foreground border-primary shadow-sm'
										: 'bg-background text-muted-foreground border-border/60 hover:border-border hover:text-foreground hover:bg-muted/40',
								)}
							>
								{f.label}
								{count > 0 && (
									<span
										className={cn(
											'inline-flex items-center justify-center rounded-full text-[10px] font-bold min-w-4 h-4 px-1 leading-none',
											isActive
												? 'bg-primary-foreground/20 text-primary-foreground'
												: 'bg-primary/10 text-primary',
										)}
									>
										{count}
									</span>
								)}
							</button>
						);
					})}

				</div>

				<div className="relative w-full sm:w-64">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none md:w-3.5 md:h-3.5" />
					<Input
						type="search"
						placeholder="Pet, passeador ou endereço..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						aria-label="Buscar passeios"
						enterKeyHint="search"
						className="pl-9 rounded-lg bg-background h-11 md:h-9"
					/>
				</div>
			</div>

			{/* Grid */}
			{filtered.length === 0 ? (
				<WalksEmptyState filtered={activeFilter !== 'todos' || search.length > 0} />
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filtered.map((walk, i) => (
						<div
							key={walk.id}
							style={{ animationDelay: `${i * 40}ms` }}
							className="min-w-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 duration-300"
						>
							<WalkCard
								walk={walk}
								onCancel={handleCancel}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
