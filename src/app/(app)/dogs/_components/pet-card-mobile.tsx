"use client";

import { ChevronRight, StickyNote } from "lucide-react";
import type { Pet } from "@/types";
import { PetAvatar } from "./pet-avatar";
import { SizeBadge } from "./size-badge";

/**
 * Phones only: one tappable card per dog. Breed, age and sex read as one line instead of
 * three pills, the notes as plain text, and editing or removing lives in the sheet the card
 * opens — so the list carries no footer of small actions.
 */
export function PetCardMobile({ pet, onOpen }: { pet: Pet; onOpen: (pet: Pet) => void }) {
	const details = [
		pet.breed,
		`${pet.age} ${pet.age === 1 ? "ano" : "anos"}`,
		pet.gender === "male" ? "Macho" : "Fêmea",
	].join(" · ");

	return (
		<button
			type="button"
			onClick={() => onOpen(pet)}
			aria-label={`Editar ${pet.name}`}
			className="w-full rounded-2xl border border-border/50 bg-card p-4 text-left transition-colors active:bg-accent/40 md:hidden"
		>
			<div className="flex items-center gap-3.5">
				<PetAvatar pet={pet} />
				<div className="min-w-0 flex-1">
					<p className="truncate text-lg font-semibold leading-tight text-foreground">{pet.name}</p>
					<p className="mt-0.5 truncate text-sm text-muted-foreground">{details}</p>
					<div className="mt-2">
						<SizeBadge size={pet.size} />
					</div>
				</div>
				<ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/60" />
			</div>

			<div className="mt-3.5 flex items-start gap-2 border-t border-border/50 pt-3">
				<StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
				{pet.notes ? (
					<p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{pet.notes}</p>
				) : (
					<p className="text-sm text-muted-foreground/80">
						Sem observações. Conte ao passeador como {pet.gender === "male" ? "ele" : "ela"} se comporta.
					</p>
				)}
			</div>
		</button>
	);
}
