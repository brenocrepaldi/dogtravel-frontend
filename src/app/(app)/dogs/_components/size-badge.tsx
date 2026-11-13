import { DOG_SIZE_LABEL } from "@/lib/pets";
import { cn } from "@/lib/utils";

// Badge de porte estilizado
const SIZE_CONFIG: Record<string, { label: string; color: string }> = {
	small: {
		label: "Pequeno",
		color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
	},
	medium: {
		label: "Médio",
		color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
	},
	large: {
		label: "Grande",
		color: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
	},
	giant: {
		label: "Gigante",
		color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
	},
};

export function SizeBadge({ size }: { size: string }) {
	const config = SIZE_CONFIG[size] ?? {
		label: DOG_SIZE_LABEL[size as keyof typeof DOG_SIZE_LABEL] ?? size,
		color: "bg-muted text-muted-foreground border-border",
	};
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
				config.color
			)}
		>
			{config.label}
		</span>
	);
}
