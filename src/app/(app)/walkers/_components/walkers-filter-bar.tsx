'use client';

import { Dog, Search, ShieldCheck, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DOG_SIZE_LABEL } from '@/lib/pets';
import type { DogSize } from '@/types';
import { TOUCH_TARGET } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface WalkersFilterProps {
	inputQuery: string;
	onInputQueryChange: (value: string) => void;
	sizeFilter: DogSize | '';
	onSizeFilterChange: (value: DogSize | '') => void;
	onlyWithTrustPack: boolean;
	onOnlyWithTrustPackChange: (value: boolean) => void;
	fitMyPets: boolean;
	onFitMyPetsChange: (value: boolean) => void;
	hasActiveFilters: boolean;
	onClear: () => void;
}

export const SIZE_OPTIONS: Array<{ value: DogSize | ''; label: string }> = [
	{ value: '', label: 'Todos' },
	...(Object.entries(DOG_SIZE_LABEL) as Array<[DogSize, string]>).map(([value, label]) => ({
		value,
		label,
	})),
];

// 36px visual chip with a 44px hit area (TOUCH_TARGET)
const CHIP = cn(
	'relative inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors',
	TOUCH_TARGET,
);
const CHIP_IDLE = 'border-border bg-card text-muted-foreground';

function ToggleChip({
	icon: Icon,
	label,
	pressed,
	onPressedChange,
}: {
	icon: LucideIcon;
	label: string;
	pressed: boolean;
	onPressedChange: (value: boolean) => void;
}) {
	return (
		<button
			type="button"
			aria-pressed={pressed}
			onClick={() => onPressedChange(!pressed)}
			className={cn(CHIP, pressed ? 'border-primary bg-primary/10 text-primary' : CHIP_IDLE)}
		>
			<Icon className="h-4 w-4" aria-hidden />
			{label}
		</button>
	);
}

export function WalkersFilterBar({
	inputQuery,
	onInputQueryChange,
	sizeFilter,
	onSizeFilterChange,
	onlyWithTrustPack,
	onOnlyWithTrustPackChange,
	fitMyPets,
	onFitMyPetsChange,
}: WalkersFilterProps) {
	return (
		<div className="space-y-2 lg:hidden">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
				<Input
					type="search"
					aria-label="Buscar passeadores"
					value={inputQuery}
					onChange={(e) => onInputQueryChange(e.target.value)}
					placeholder="Nome, região ou especialidade..."
					className="h-11 pl-9 bg-card"
				/>
			</div>

			{/* py-1 keeps the chips' 44px hit area inside the scroll box */}
			<div className="-mx-4 flex gap-2 overflow-x-auto no-scrollbar px-4 py-1">
				{SIZE_OPTIONS.map(({ value, label }) => (
					<button
						key={value || 'all'}
						type="button"
						aria-pressed={sizeFilter === value}
						onClick={() => onSizeFilterChange(value)}
						className={cn(
							CHIP,
							sizeFilter === value ? 'border-primary bg-primary text-primary-foreground' : CHIP_IDLE,
						)}
					>
						{label}
					</button>
				))}

				<span aria-hidden className="my-1.5 w-px shrink-0 self-stretch bg-border" />

				<ToggleChip
					icon={ShieldCheck}
					label="Pack de confiança"
					pressed={onlyWithTrustPack}
					onPressedChange={onOnlyWithTrustPackChange}
				/>
				<ToggleChip
					icon={Dog}
					label="Para meus cães"
					pressed={fitMyPets}
					onPressedChange={onFitMyPetsChange}
				/>
			</div>
		</div>
	);
}
