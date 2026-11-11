import Image from 'next/image';
import { PawPrint } from 'lucide-react';

/** A dog in a walk card: its photo (or a paw) and its name, as a soft pill. */
export function PetChip({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
	return (
		<span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 py-0.5 pl-0.5 pr-2.5 text-xs font-semibold text-foreground">
			<span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-amber-100 ring-1 ring-background">
				{photoUrl ? (
					<Image src={photoUrl} alt="" fill sizes="24px" className="object-cover" />
				) : (
					<span className="flex h-full w-full items-center justify-center">
						<PawPrint className="h-3 w-3 text-amber-600" />
					</span>
				)}
			</span>
			<span className="max-w-[6rem] truncate">{name}</span>
		</span>
	);
}
