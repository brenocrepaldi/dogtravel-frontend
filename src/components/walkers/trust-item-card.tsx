import React from 'react';
import { cn } from '@/lib/utils';

type TrustItemCardProps = {
	icon: React.ElementType;
	label: string;
	value: string;
	verified?: boolean;
	accent?: 'emerald' | 'amber' | 'cyan';
};

	const accentClasses = {
		emerald: {
			border: 'border-emerald-200 dark:border-emerald-900/40',
			borderLeft: 'border-l-emerald-500',
			background: 'bg-emerald-50/50 dark:bg-emerald-950/20',
			iconBackground: 'bg-emerald-100 dark:bg-emerald-900/50',
			icon: 'text-emerald-600 dark:text-emerald-400',
			label: 'text-emerald-700 dark:text-emerald-300',
			value: 'text-emerald-600 dark:text-emerald-400',
			check: 'bg-emerald-200 dark:bg-emerald-900/60',
			checkIcon: 'text-emerald-700 dark:text-emerald-300',
		},
		amber: {
			border: 'border-amber-200 dark:border-amber-900/40',
			borderLeft: 'border-l-amber-500',
			background: 'bg-amber-50/50 dark:bg-amber-950/20',
			iconBackground: 'bg-amber-100 dark:bg-amber-900/50',
			icon: 'text-amber-600 dark:text-amber-400',
			label: 'text-amber-700 dark:text-amber-300',
			value: 'text-amber-600 dark:text-amber-400',
			check: 'bg-amber-200 dark:bg-amber-900/60',
			checkIcon: 'text-amber-700 dark:text-amber-300',
		},
		cyan: {
			border: 'border-cyan-200 dark:border-cyan-900/40',
			borderLeft: 'border-l-cyan-500',
			background: 'bg-cyan-50/50 dark:bg-cyan-950/20',
			iconBackground: 'bg-cyan-100 dark:bg-cyan-900/50',
			icon: 'text-cyan-600 dark:text-cyan-400',
			label: 'text-cyan-700 dark:text-cyan-300',
			value: 'text-cyan-600 dark:text-cyan-400',
			check: 'bg-cyan-200 dark:bg-cyan-900/60',
			checkIcon: 'text-cyan-700 dark:text-cyan-300',
		},
	} as const;

export function TrustItemCard({ icon: Icon, label, value, verified = true, accent }: TrustItemCardProps) {
	const resolvedAccent = accent ?? (verified ? 'emerald' : 'amber');
	const theme = accentClasses[resolvedAccent];
	return (
		<div
			className={cn(
				'flex gap-4 rounded-xl border-l-4 p-4',
				'transition-all duration-300 hover:shadow-md hover:translate-x-1',
				theme.borderLeft,
				theme.background,
				theme.border,
			)}
		>
			{/* Icon */}
			<div
				className={cn(
					'mt-0.5 flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg',
					theme.iconBackground,
				)}
			>
				<Icon
					className={cn(
						'h-5 w-5 transition-transform group-hover:scale-110',
						theme.icon,
					)}
				/>
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<p
						className={cn(
							'text-sm font-semibold md:text-xs md:font-bold md:uppercase md:tracking-wider',
							theme.label,
						)}
					>
						{label}
					</p>
					{/* {verified && (
						<span className={cn('inline-flex h-5 w-5 items-center justify-center rounded-full', theme.check)}>
							<svg
								className={cn('h-3 w-3', theme.checkIcon)}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={3}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</span>
					)} */}
				</div>
				<p className={cn('mt-1.5 text-sm font-medium leading-relaxed', theme.value)}>{value}</p>
			</div>
		</div>
	);
}
