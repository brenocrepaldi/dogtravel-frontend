'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useDogs } from '@/features/dogs/hooks/use-dogs';
import { useWalkers } from '@/features/walkers/hooks/use-walkers';
import type { DogSize } from '@/types';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingState } from '@/components/common/loading-state';
import { trackMetricEvent } from '@/lib/metrics';
import { WalkerCard } from './walker-card';
import { WalkersFilterBar, type WalkersFilterProps } from './walkers-filter-bar';
import { WalkersFilterCard, WalkersTipsSidebar } from './walkers-filter-card';

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

	const filterProps: WalkersFilterProps = {
		inputQuery,
		onInputQueryChange: setInputQuery,
		sizeFilter,
		onSizeFilterChange: setSizeFilter,
		onlyWithTrustPack,
		onOnlyWithTrustPackChange: setOnlyWithTrustPack,
		fitMyPets,
		onFitMyPetsChange: setFitMyPets,
		hasActiveFilters,
		onClear: clearFilters,
	};

	return (
		<div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-10">
			{/* ── Aside: chips no mobile, card de filtros + dicas no desktop ── */}
			<aside className="w-full shrink-0 lg:w-72 lg:order-2 lg:sticky lg:top-8 lg:self-start lg:space-y-4">
				<WalkersFilterBar {...filterProps} />
				<WalkersFilterCard {...filterProps} />
				<WalkersTipsSidebar />
			</aside>

			{/* ── Main: resultados ── */}
			<div className="flex min-w-0 flex-1 flex-col gap-4 lg:gap-6 lg:order-1">
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
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<div className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
								<span className="text-sm text-muted-foreground">
									{filteredWalkers.length}{' '}
									{filteredWalkers.length === 1 ? 'passeador encontrado' : 'passeadores encontrados'}
								</span>
							</div>
							{hasActiveFilters && (
								<button
									type="button"
									onClick={clearFilters}
									className="-my-3 py-3 text-sm font-medium text-primary cursor-pointer lg:hidden"
								>
									Limpar filtros
								</button>
							)}
						</div>

						<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 items-start">
							{filteredWalkers.map((walker, index) => (
								<WalkerCard key={walker.id} walker={walker} index={index} />
							))}
						</div>

						<p className="text-center text-sm text-muted-foreground/70 py-6 lg:py-8">
							O selo de verificado indica perfis aprovados pela equipe DogTravel.
						</p>
					</>
				)}
			</div>
		</div>
	);
}
