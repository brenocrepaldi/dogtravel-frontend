'use client';

import { Dog, Info, Lightbulb, MapPin, Search, ShieldCheck, SlidersHorizontal, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SIZE_OPTIONS, type WalkersFilterProps } from './walkers-filter-bar';

export function WalkersFilterCard({
	inputQuery,
	onInputQueryChange,
	sizeFilter,
	onSizeFilterChange,
	onlyWithTrustPack,
	onOnlyWithTrustPackChange,
	fitMyPets,
	onFitMyPetsChange,
	hasActiveFilters,
	onClear,
}: WalkersFilterProps) {
	return (
		<Card className="hidden lg:flex overflow-hidden border-border/70">
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
							onClick={onClear}
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
							onChange={(e) => onInputQueryChange(e.target.value)}
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
								onClick={() => onSizeFilterChange(value)}
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
							<Label htmlFor="trust-pack" className="text-sm cursor-pointer leading-tight font-normal">
								Pack completo de confiança
							</Label>
							<Switch
								id="trust-pack"
								checked={onlyWithTrustPack}
								onCheckedChange={onOnlyWithTrustPackChange}
							/>
						</div>
						<div className="flex items-center justify-between gap-3">
							<Label htmlFor="fit-my-pets" className="text-sm cursor-pointer leading-tight font-normal">
								Compatível com meus cães
							</Label>
							<Switch id="fit-my-pets" checked={fitMyPets} onCheckedChange={onFitMyPetsChange} />
						</div>
					</div>
				</div>

				{/* Dica contextual */}
				<p className="flex items-start gap-1.5 text-xs text-muted-foreground border-t border-border/40 pt-3">
					<Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/60" />
					Ative &ldquo;Compatível com meus cães&rdquo; para uma seleção personalizada baseada nos
					seus pets.
				</p>
			</CardContent>
		</Card>
	);
}

const WALKER_TIPS = [
	{ icon: Star, text: 'Verifique a nota e o número de avaliações antes de agendar.' },
	{
		icon: ShieldCheck,
		text: 'Dê preferência a passeadores com pack completo de confiança verificado.',
	},
	{ icon: Dog, text: 'Use o filtro de porte para garantir compatibilidade com seus cães.' },
	{ icon: MapPin, text: 'Escolha alguém que atue próximo à sua região para mais conveniência.' },
] as const;

export function WalkersTipsSidebar() {
	return (
		<Card className="hidden lg:flex overflow-hidden">
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
