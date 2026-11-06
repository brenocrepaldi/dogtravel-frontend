'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/format';

const WALKER_GRADIENTS = [
	'from-blue-400/30 to-indigo-500/30',
	'from-emerald-400/30 to-teal-500/30',
	'from-amber-400/30 to-orange-500/30',
	'from-rose-400/30 to-pink-500/30',
	'from-violet-400/30 to-purple-500/30',
	'from-cyan-400/30 to-sky-500/30',
];

type WalkerAvatarProps = {
	name: string;
	avatarUrl?: string | null;
	/** next/image `sizes` hint, e.g. "56px" */
	sizes: string;
	/** Size and radius, e.g. "w-14 h-14 rounded-2xl" */
	className?: string;
	/** Text size of the initials fallback, e.g. "text-base" */
	initialsClassName?: string;
};

export function WalkerAvatar({ name, avatarUrl, sizes, className, initialsClassName }: WalkerAvatarProps) {
	// A photo that fails to load (e.g. storage unreachable) falls back to the initials
	const [failed, setFailed] = useState(false);

	if (avatarUrl && !failed) {
		return (
			<div className={cn('relative shrink-0 ring-2 ring-border/30 overflow-hidden', className)}>
				<Image
					src={avatarUrl}
					alt={name}
					fill
					sizes={sizes}
					className="object-cover"
					onError={() => setFailed(true)}
				/>
			</div>
		);
	}

	return (
		<div
			className={cn(
				'bg-gradient-to-br flex items-center justify-center shrink-0 ring-2 ring-border/30',
				WALKER_GRADIENTS[name.charCodeAt(0) % WALKER_GRADIENTS.length],
				className,
			)}
		>
			<span className={cn('font-bold text-foreground/70', initialsClassName)}>{getInitials(name)}</span>
		</div>
	);
}
