'use client';

import { useEffect, useMemo, useState } from 'react';
import {
	Dog,
	Info,
	Lightbulb,
	MapPin,
	Search,
	ShieldCheck,
	SlidersHorizontal,
	Star,
} from 'lucide-react';
import { useDogs } from '@/features/dogs/hooks/use-dogs';
import { useWalkers } from '@/features/walkers/hooks/use-walkers';
import { cn } from '@/lib/utils';
import type { DogSize } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingState } from '@/components/common/loading-state';
import { trackMetricEvent } from '@/lib/metrics';
import { WalkerCard } from './walker-card';

// ─── Size labels ──────────────────────────────────────────────────────────────

const SIZE_OPTIONS: Array<{ value: DogSize | ''; label: string }> = [
	{ value: '', label: 'Todos' },
	{ value: 'small', label: 'Pequeno' },
	{ value: 'medium', label: 'Médio' },
	{ value: 'large', label: 'Grande' },
	{ value: 'giant', label: 'Gigante' },
];

// ─── Tips Sidebar ─────────────────────────────────────────────────────────────

const WALKER_TIPS = [
	{ icon: Star, text: 'Verifique a nota e o número de avaliações antes de agendar.' },
	{
		icon: ShieldCheck,
		text: 'Dê preferência a passeadores com pack completo de confiança verificado.',
	},
	{ icon: Dog, text: 'Use o filtro de porte para garantir compatibilidade com seus cães.' },
	{ icon: MapPin, text: 'Escolha alguém que atue próximo à sua região para mais conveniência.' },
] as const;

function WalkersTipsSidebar() {
	return (
		<Card className="overflow-hidden">
			<div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />

			<CardHeader className="pb-2 pt-5">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
						<Lightbulb className="w-4 h-4 text-primary" />
					</div>
					<div>
						<CardTitle className="text-sm font-semibold">Como escolher</CardTitle>
						<CardDescription className="text-xs mt-0.5">
							Dicas para encontrar o passeador ideal
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pb-3">
				<ul className="space-y-3.5 mt-1">
					{WALKER_TIPS.map((tip, i) => {
						const Icon = tip.icon;
						return (
							<li key={i} className="flex items-start gap-3">
								<div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
									<Icon className="w-3.5 h-3.5" />
								</div>
								<p className="text-xs text-muted-foreground leading-relaxed">{tip.text}</p>
							</li>
						);
					})}
				</ul>
			</CardContent>
		</Card>
	);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inferBehaviorNeeds(notes: string | undefined) {
	const text = (notes ?? '').toLowerCase();
	return {
		needsReactiveSupport:
			text.includes('reativ') || text.includes('agitado') || text.includes('medo'),
		needsMultiDogSupport:
			text.includes('puxa') || text.includes('mais de 1') || text.includes('dois'),
	};
}

// ─── Main Explorer ────────────────────────────────────────────────────────────

export function WalkersExplorer() {
	const { data: pets = [] } = useDogs();

	// query + size drive the API fetch; trustPack + fitMyPets are client-side only
	const [inputQuery, setInputQuery] = useState('');
	const [query, setQuery] = useState('');
	const [sizeFilter, setSizeFilter] = useState<DogSize | ''>('');
	const [onlyWithTrustPack, setOnlyWithTrustPack] = useState(false);
	const [fitMyPets, setFitMyPets] = useState(false);

	// Debounce text input so we don't fire a request on every keystroke
	useEffect(() => {
		const timer = setTimeout(() => setQuery(inputQuery), 300);
		return () => clearTimeout(timer);
	}, [inputQuery]);

	const { data: walkers = [], isLoading } = useWalkers({
		query: query || undefined,
		size:  sizeFilter || undefined,
	});

	const hasActiveFilters =
		Boolean(inputQuery.trim()) || sizeFilter !== '' || onlyWithTrustPack || fitMyPets;

	const derivedProfile = useMemo(() => {
		const sizes = new Set<DogSize>();
		let needsReactiveSupport = false;
		let needsMultiDogSupport = false;

		for (const pet of pets) {
			sizes.add(pet.size);
			const behaviorNeeds = inferBehaviorNeeds(pet.notes);
			needsReactiveSupport ||= behaviorNeeds.needsReactiveSupport;
			needsMultiDogSupport ||= behaviorNeeds.needsMultiDogSupport;
		}

		return {
			sizes: Array.from(sizes),
			needsReactiveSupport,
			needsMultiDogSupport: needsMultiDogSupport || pets.length > 1,
		};
	}, [pets]);

	// query + size are already filtered server-side; trustPack + fitMyPets are client-side only
	const filteredWalkers = useMemo(() => {
		return walkers.filter((walker) => {
			const hasTrustPack =
				walker.trustChecks.identityVerified && walker.trustChecks.backgroundCheck;
			const matchesTrust = !onlyWithTrustPack || hasTrustPack;

			if (!fitMyPets) return matchesTrust;

			const supportsAllMySizes =
				derivedProfile.sizes.length === 0 ||
				derivedProfile.sizes.every((size) => walker.supportedSizes.includes(size));
			const supportsReactive =
				!derivedProfile.needsReactiveSupport || walker.behaviorExpertise.includes('reativo');
			const supportsMultiDog =
				!derivedProfile.needsMultiDogSupport || walker.behaviorExpertise.includes('multiplos-caes');

			return matchesTrust && supportsAllMySizes && supportsReactive && supportsMultiDog;
		});
	}, [derivedProfile, fitMyPets, onlyWithTrustPack, walkers]);

	useEffect(() => {
		if (fitMyPets) {
			trackMetricEvent({
				name: 'walkers_fit_my_pets_enabled',
				payload: {
					petsCount: pets.length,
					needsReactiveSupport: derivedProfile.needsReactiveSupport,
					needsMultiDogSupport: derivedProfile.needsMultiDogSupport,
				},
			});
		}
	}, [
		derivedProfile.needsMultiDogSupport,
		derivedProfile.needsReactiveSupport,
		fitMyPets,
		pets.length,
	]);

	useEffect(() => {
		if (!hasActiveFilters) return;
		trackMetricEvent({
			name: 'walkers_filters_applied',
			payload: {
				queryLength: inputQuery.trim().length,
				sizeFilter,
				onlyWithTrustPack,
				fitMyPets,
				resultCount: filteredWalkers.length,
			},
		});
	}, [filteredWalkers.length, fitMyPets, hasActiveFilters, inputQuery, onlyWithTrustPack, sizeFilter]);

	const clearFilters = () => {
		setInputQuery('');
		setQuery('');
		setSizeFilter('');
		setOnlyWithTrustPack(false);
		setFitMyPets(false);
	};

	return (
		<div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10">
			{/* ── Aside: filtros + dicas ── */}
			<aside className="w-full shrink-0 lg:w-72 lg:order-2 lg:sticky lg:top-8 lg:self-start space-y-4">
				{/* Filtro */}
				<Card className="overflow-hidden border-border/70">
					<div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />

					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
									<SlidersHorizontal className="w-4 h-4 text-primary" />
								</div>
								<div>
									<CardTitle className="text-sm font-semibold">Filtrar</CardTitle>
									<CardDescription className="text-xs mt-0.5">Refine sua busca</CardDescription>
								</div>
							</div>
							{hasActiveFilters && (
								<button
									type="button"
									onClick={clearFilters}
									className="text-[11px] text-primary/70 hover:text-primary transition-colors font-medium cursor-pointer"
								>
									Limpar
								</button>
							)}
						</div>
					</CardHeader>

					<CardContent className="pb-3 space-y-4">
						{/* Busca */}
						<div className="space-y-1.5">
							<Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
								Busca
							</Label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
								<Input
									type="search"
									value={inputQuery}
									onChange={(e) => setInputQuery(e.target.value)}
									placeholder="Nome, região ou especialidade..."
									className="pl-9 bg-background"
								/>
							</div>
						</div>

						{/* Porte — pills de seleção */}
						<div className="space-y-1.5">
							<Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
								Porte do cão
							</Label>
							<div className="flex flex-wrap gap-1.5">
								{SIZE_OPTIONS.map(({ value, label }) => (
									<button
										key={value || 'all'}
										type="button"
										onClick={() => setSizeFilter(value)}
										className={cn(
											'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer',
											sizeFilter === value
												? 'border-primary bg-primary text-primary-foreground'
												: 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
										)}
									>
										{label}
									</button>
								))}
							</div>
						</div>

						<div className="h-px bg-border/40" />

						{/* Toggles */}
						<div className="space-y-1.5">
							<Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
								Filtros rápidos
							</Label>
							<div className="space-y-3 pt-0.5">
								<div className="flex items-center justify-between gap-3">
									<Label
										htmlFor="trust-pack"
										className="text-sm cursor-pointer leading-tight font-normal"
									>
										Pack completo de confiança
									</Label>
									<Switch
										id="trust-pack"
										checked={onlyWithTrustPack}
										onCheckedChange={setOnlyWithTrustPack}
									/>
								</div>
								<div className="flex items-center justify-between gap-3">
									<Label
										htmlFor="fit-my-pets"
										className="text-sm cursor-pointer leading-tight font-normal"
									>
										Compatível com meus cães
									</Label>
									<Switch id="fit-my-pets" checked={fitMyPets} onCheckedChange={setFitMyPets} />
								</div>
							</div>
						</div>

						{/* Dica contextual */}
						<p className="flex items-start gap-1.5 text-xs text-muted-foreground border-t border-border/40 pt-3">
							<Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/60" />
							Ative &ldquo;Compatível com meus cães&rdquo; para uma seleção personalizada baseada
							nos seus pets.
						</p>
					</CardContent>
				</Card>

				{/* Dicas */}
				<WalkersTipsSidebar />
			</aside>

			{/* ── Main: resultados ── */}
			<div className="flex min-w-0 flex-1 flex-col gap-6 lg:order-1">
				{isLoading ? (
					<LoadingState variant="section" text="Carregando passeadores..." />
				) : filteredWalkers.length === 0 ? (
					<EmptyState
						icon={Search}
						title="Nenhum passeador encontrado"
						description="Ajuste os filtros para ampliar a busca e encontrar um perfil mais compatível."
						actionLabel={hasActiveFilters ? 'Limpar filtros' : undefined}
						onAction={clearFilters}
					/>
				) : (
					<>
						<div className="flex items-center gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
							<span className="text-sm text-muted-foreground">
								{filteredWalkers.length}{' '}
								{filteredWalkers.length === 1 ? 'passeador encontrado' : 'passeadores encontrados'}
							</span>
						</div>

						<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 items-start">
							{filteredWalkers.map((walker, index) => (
								<WalkerCard key={walker.id} walker={walker} index={index} />
							))}
						</div>

						<p className="text-center text-sm text-muted-foreground/70 py-8">
							Todos os perfis são verificados pela equipe DogTravel.
						</p>
					</>
				)}
			</div>
		</div>
	);
}
