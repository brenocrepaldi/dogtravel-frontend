'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Calendar, ChevronRight, Clock3, MapPin, ShieldCheck, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAvailabilityLabel } from '@/lib/availability';
import { getInitials } from '@/lib/format';
import { DOG_SIZE_LABEL } from '@/lib/pets';
import type { WalkerProfile } from '@/types';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const WALKER_GRADIENTS = [
	'from-blue-400/30 to-indigo-500/30',
	'from-emerald-400/30 to-teal-500/30',
	'from-amber-400/30 to-orange-500/30',
	'from-rose-400/30 to-pink-500/30',
	'from-violet-400/30 to-purple-500/30',
	'from-cyan-400/30 to-sky-500/30',
];

// Tags beyond this count collapse into a "+n" badge on mobile
const MOBILE_TAG_LIMIT = 3;

function WalkerAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
	const [failed, setFailed] = useState(false);

	if (avatarUrl && !failed) {
		return (
			<div className="relative w-14 h-14 rounded-2xl shrink-0 ring-2 ring-border/30 overflow-hidden">
				<Image
					src={avatarUrl}
					alt={name}
					fill
					sizes="56px"
					className="object-cover"
					onError={() => setFailed(true)}
				/>
			</div>
		);
	}

	return (
		<div
			className={cn(
				'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0 ring-2 ring-border/30',
				WALKER_GRADIENTS[name.charCodeAt(0) % WALKER_GRADIENTS.length],
			)}
		>
			<span className="text-base font-bold text-foreground/70">{getInitials(name)}</span>
		</div>
	);
}

export function WalkerCard({ walker, index }: { walker: WalkerProfile; index: number }) {
	const hiddenTagCount = Math.max(walker.tags.length - MOBILE_TAG_LIMIT, 0);

	return (
		<div
			style={{ animationDelay: `${index * 60}ms` }}
			className="animate-in fade-in slide-in-from-bottom-2 duration-400 h-full"
		>
			<div className="group relative flex flex-col h-full rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-black/5 hover:border-border hover:-translate-y-0.5 dark:hover:shadow-black/20">
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

				<div className="flex flex-col flex-1 p-4 gap-3 lg:p-5 lg:gap-4">
					{/* Avatar + nome + avaliação */}
					<div className="flex items-center gap-4">
						<WalkerAvatar name={walker.name} avatarUrl={walker.avatarUrl} />

						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-1.5 flex-wrap">
								<h3 className="text-base font-semibold text-foreground leading-tight">
									{/* Stretched link: on mobile the whole card opens the profile */}
									<Link href={`/walkers/${walker.id}`} className="after:absolute after:inset-0 lg:after:hidden">
										{walker.name}
									</Link>
								</h3>
								{walker.verified && (
									<ShieldCheck className="w-4 h-4 text-primary shrink-0" aria-label="Verificado" />
								)}
							</div>

							<div className="flex items-center gap-x-3 gap-y-0.5 mt-0.5 text-sm text-muted-foreground flex-wrap">
								<span className="flex items-center gap-1">
									<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
									<span className="font-semibold text-foreground">{walker.rating.toFixed(1)}</span>
									<span className="text-xs">({walker.reviews})</span>
									<span className="text-xs lg:hidden">· {walker.completedWalks} passeios</span>
								</span>
								<span className="flex items-center gap-1 min-w-0 max-w-full lg:max-w-[180px]">
									<MapPin className="w-3.5 h-3.5 shrink-0" />
									<span className="truncate text-xs">{walker.location}</span>
								</span>
							</div>
						</div>
					</div>

					{/* Descrição */}
					<p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed lg:line-clamp-2">
						{walker.description}
					</p>

					{/* Tags — no mobile só as 3 primeiras + contador */}
					{walker.tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{walker.tags.map((tag, i) => (
								<Badge
									key={tag}
									variant="secondary"
									className={cn('text-xs font-normal', i >= MOBILE_TAG_LIMIT && 'max-lg:hidden')}
								>
									{tag}
								</Badge>
							))}
							{hiddenTagCount > 0 && (
								<Badge variant="secondary" className="text-xs font-normal lg:hidden">
									+{hiddenTagCount}
								</Badge>
							)}
						</div>
					)}

					{/* Portes suportados */}
					<div className="flex flex-wrap items-center gap-1.5">
						{walker.supportedSizes.map((size) => (
							<Badge
								key={`${walker.id}-${size}`}
								variant="outline"
								className="text-[11px] text-muted-foreground"
							>
								{DOG_SIZE_LABEL[size]}
							</Badge>
						))}
					</div>

					{/* Stats — só no desktop; no mobile os passeios vão na linha da nota */}
					<div className="hidden lg:block rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-xs space-y-1.5">
						<span className="flex items-center gap-1.5 text-muted-foreground">
							<Clock3 className="h-3.5 w-3.5 shrink-0" />
							<span className="font-semibold text-foreground">{walker.completedWalks}</span>
							<span>passeios realizados</span>
						</span>
						<span className="flex items-center gap-1.5 text-muted-foreground">
							<Calendar className="h-3.5 w-3.5 shrink-0" />
							<span className="truncate">{formatAvailabilityLabel(walker.availability)}</span>
						</span>
					</div>

					{/* Ação principal — acima do stretched link */}
					<Link
						href={`/walks/new?walker=${walker.id}`}
						className={cn(
							buttonVariants({ variant: 'default', size: 'xl' }),
							'relative z-10 w-full mt-auto lg:h-9 lg:px-2.5',
						)}
					>
						Agendar passeio
					</Link>
				</div>

				{/* Rodapé do card — só no desktop */}
				<Link
					href={`/walkers/${walker.id}`}
					className="hidden lg:flex items-center justify-center gap-1 text-[11px] text-primary/80 hover:text-primary transition-colors font-medium border-t border-border/40 bg-muted/20"
				>
					<div className="shrink-0 px-5 py-3 flex items-center">
						Ver perfil completo
						<ChevronRight className="w-3 h-3" />
					</div>
				</Link>
			</div>
		</div>
	);
}
