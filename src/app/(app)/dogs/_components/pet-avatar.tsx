"use client";

import { useState } from "react";
import Image from "next/image";
import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Pet } from "@/types";

const SIZES = {
	md: { box: "w-16 h-16", icon: "h-6 w-6" },
	lg: { box: "w-20 h-20", icon: "h-8 w-8" },
} as const;

// Avatar do pet — imagem real ou patinha âmbar como fallback. A photo that fails to load
// (storage or the image host unreachable) falls back to the paw instead of an empty box.
export function PetAvatar({
	pet,
	size = "md",
	className,
}: {
	pet: Pick<Pet, "name" | "photoUrl">;
	size?: keyof typeof SIZES;
	className?: string;
}) {
	const [failedUrl, setFailedUrl] = useState<string | null>(null);
	const { box, icon } = SIZES[size];

	const showPhoto = Boolean(pet.photoUrl) && pet.photoUrl !== failedUrl;

	// The paw sits under the photo, so a slow or broken image shows the paw, never a blank box.
	return (
		<div
			className={cn(
				"relative rounded-2xl overflow-hidden shrink-0 ring-2 ring-border/30 bg-amber-500/10 flex items-center justify-center",
				box,
				className,
			)}
		>
			<PawPrint className={cn(icon, "text-amber-600 dark:text-amber-400")} />
			{showPhoto && (
				<Image
					src={pet.photoUrl!}
					alt={pet.name}
					fill
					sizes="80px"
					className="object-cover"
					onError={() => setFailedUrl(pet.photoUrl ?? null)}
				/>
			)}
		</div>
	);
}
