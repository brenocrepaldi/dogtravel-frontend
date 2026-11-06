import React from 'react';
import { cn } from '@/lib/utils';

type IconColor = 'primary' | 'info' | 'success' | 'warning';
type Size = 'sm' | 'md';

const iconColorMap: Record<IconColor, { bg: string; text: string; border: string; icon: string }> =
	{
		primary: {
			bg: 'bg-slate-50 dark:bg-slate-950/20',
			text: 'text-slate-500 dark:text-slate-400',
			border: 'border-slate-200 dark:border-slate-900/30',
			icon: 'bg-slate-100 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400',
		},
		info: {
			bg: 'bg-blue-50/70 dark:bg-blue-950/15',
			text: 'text-blue-600 dark:text-blue-400',
			border: 'border-blue-100 dark:border-blue-900/30',
			icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
		},
		success: {
			bg: 'bg-emerald-50/70 dark:bg-emerald-950/15',
			text: 'text-emerald-600 dark:text-emerald-400',
			border: 'border-emerald-100 dark:border-emerald-900/30',
			icon: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
		},
		warning: {
			bg: 'bg-amber-50 dark:bg-amber-950/30',
			text: 'text-amber-600 dark:text-amber-400',
			border: 'border-amber-200 dark:border-amber-900/40',
			icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
		},
	};

type InfoBlockEnhancedProps = {
	icon: React.ElementType;
	label: string;
	value: string;
	color?: IconColor;
	size?: Size;
};

export function InfoBlockEnhanced({
	icon: Icon,
	label,
	value,
	color = 'primary',
	size = 'md',
}: InfoBlockEnhancedProps) {
	const colors = iconColorMap[color];
	const isSm = size === 'sm';

	return (
		<div
			className={cn(
				'group relative overflow-hidden rounded-xl transition-all duration-300',
				'border transition-all',
				isSm ? 'p-3 border' : 'p-4 border-2',
				!isSm && 'hover:shadow-md hover:-translate-y-0.5',
				colors.bg,
				colors.border,
			)}
		>
			{/* Icon Circle Background */}
			<div
				className={cn(
					'inline-flex items-center justify-center',
					'rounded-full transition-all duration-300',
					isSm ? 'h-8 w-8 mb-2' : 'h-12 w-12 mb-3 group-hover:scale-110',
					colors.icon,
				)}
			>
				<Icon className={isSm ? 'h-4 w-4' : 'h-6 w-6'} />
			</div>

			{/* Label */}
			<p
				className={cn(
					'font-semibold uppercase tracking-wider',
					isSm ? 'mb-1 text-xs' : 'mb-2 text-xs font-bold',
					colors.text,
				)}
			>
				{label}
			</p>

			{/* Value */}
			<p className={cn('font-bold text-foreground', isSm ? 'text-sm' : 'text-lg')}>{value}</p>
		</div>
	);
}
