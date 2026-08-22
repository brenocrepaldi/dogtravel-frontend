"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
	Edit2,
	Info,
	Plus,
	Dog,
	Heart,
	PawPrint,
	Shield,
	Star,
	ChevronRight,
	ChevronDown,
	ChevronUp,
	Trash2,
	AlertCircle,
} from "lucide-react";
import { useDogs, useAddDog, useUpdateDog, useRemoveDog } from "@/features/dogs/hooks/use-dogs";
import { toast } from "sonner";
import { DOG_SIZE_LABEL } from "@/lib/pets";
import type { Pet } from "@/types";
import { Button } from "@/components/ui/button";
import { PetFormSheet, type PetDraft } from "./pet-form-sheet";
import { cn } from "@/lib/utils";

function toDraft(pet: Pet): PetDraft {
	return {
		name: pet.name,
		breed: pet.breed,
		age: pet.age,
		size: pet.size,
		gender: pet.gender,
		behavior: pet.notes ?? "",
		photoUrl: pet.photoUrl,
	};
}

// Avatar do pet — imagem real ou patinha âmbar como fallback
function PetAvatar({ pet, size = "md" }: { pet: Pet; size?: "md" | "lg" }) {
	const sizeClass    = size === "lg" ? "w-20 h-20" : "w-16 h-16";
	const iconSizeClass = size === "lg" ? "h-8 w-8"  : "h-6 w-6";

	if (pet.photoUrl) {
		return (
			<div className={cn("relative rounded-2xl overflow-hidden shrink-0 ring-2 ring-border/30", sizeClass)}>
				<Image src={pet.photoUrl} alt={pet.name} fill sizes="80px" className="object-cover" />
			</div>
		);
	}

	return (
		<div className={cn("rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 ring-2 ring-border/30", sizeClass)}>
			<PawPrint className={cn(iconSizeClass, "text-amber-600 dark:text-amber-400")} />
		</div>
	);
}

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

function SizeBadge({ size }: { size: string }) {
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

const PET_CARD_HEIGHT = "h-[252px]";

// Observações com truncamento e expandir/colapsar
function PetNotes({
	notes,
	onExpandedChange,
}: {
	notes?: string;
	onExpandedChange?: (expanded: boolean) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	const [canExpand, setCanExpand] = useState(false);
	const textRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setExpanded(false);
	}, [notes]);

	useEffect(() => {
		onExpandedChange?.(expanded);
	}, [expanded, onExpandedChange]);

	useEffect(() => {
		const el = textRef.current;
		if (!el || !notes) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setCanExpand(false);
			return;
		}

		const checkOverflow = () => {
			setCanExpand(el.scrollHeight > el.clientHeight + 1);
		};

		checkOverflow();
		window.addEventListener("resize", checkOverflow);
		return () => window.removeEventListener("resize", checkOverflow);
	}, [notes, expanded]);

	const toggleExpanded = () => {
		setExpanded((value) => !value);
	};

	if (!notes) {
		return <div className="h-[52px] shrink-0" aria-hidden />;
	}

	return (
		<div className="shrink-0">
			<div className="flex items-start gap-2 rounded-xl bg-muted/40 border border-border/40 px-3 py-2">
				<Info className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0 mt-0.5" />
				<div className="min-w-0 flex-1">
					<p
						ref={textRef}
						className={cn(
							"text-xs text-muted-foreground leading-relaxed",
							!expanded && "line-clamp-2"
						)}
					>
						{notes}
					</p>
					{(canExpand || expanded) && (
						<button
							type="button"
							onClick={toggleExpanded}
							className="mt-1.5 flex items-center gap-0.5 text-[11px] font-medium text-primary/80 hover:text-primary transition-colors cursor-pointer"
						>
							{expanded ? (
								<>
									Ver menos
									<ChevronUp className="w-3 h-3" />
								</>
							) : (
								<>
									Ver mais
									<ChevronDown className="w-3 h-3" />
								</>
							)}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

// Skeleton card para loading state
function SkeletonCard() {
	return (
		<div
			className={cn(
				"rounded-2xl border border-border/50 bg-card p-5 animate-pulse",
				PET_CARD_HEIGHT
			)}
		>
			<div className="flex gap-4">
				<div className="w-16 h-16 rounded-2xl bg-muted shrink-0" />
				<div className="flex-1 space-y-2.5 py-1">
					<div className="h-4 bg-muted rounded-lg w-1/3" />
					<div className="h-3 bg-muted rounded-lg w-1/2" />
					<div className="h-3 bg-muted rounded-lg w-1/4" />
				</div>
			</div>
		</div>
	);
}

// Empty state elegante
function EmptyState({ onAdd }: { onAdd: () => void }) {
	return (
		<div className="col-span-full flex flex-col items-center justify-center py-20 px-8 text-center">
			{/* Ícone decorativo */}
			<div className="relative mb-6">
				<div className="w-24 h-24 rounded-3xl bg-primary/5 ring-1 ring-primary/10 flex items-center justify-center text-5xl">
					🐾
				</div>
				<div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
					<Plus className="w-4 h-4 text-primary-foreground" />
				</div>
			</div>

			<h3 className="text-lg font-semibold text-foreground mb-2">
				Nenhum cão cadastrado ainda
			</h3>
			<p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-8">
				Adicione seus cães para encontrar passeadores compatíveis e gerenciar tudo em um só lugar.
			</p>

			<Button onClick={onAdd} size="lg" className="gap-2 shadow-sm">
				<Plus className="w-4 h-4" />
				Adicionar meu primeiro cão
			</Button>

			{/* Benefícios rápidos */}
			<div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
				{[
					{ icon: <Heart className="w-4 h-4" />, text: "Cuidado personalizado" },
					{ icon: <Shield className="w-4 h-4" />, text: "Passeadores verificados" },
					{ icon: <Star className="w-4 h-4" />, text: "Experiência premium" },
				].map((item, i) => (
					<div key={i} className="flex flex-col items-center gap-2">
						<div className="w-9 h-9 rounded-xl bg-primary/5 ring-1 ring-primary/10 flex items-center justify-center text-primary/60">
							{item.icon}
						</div>
						<span className="text-[11px] text-muted-foreground leading-tight">{item.text}</span>
					</div>
				))}
			</div>
		</div>
	);
}

// Card individual do pet — design premium
function PetCard({
	pet,
	onEdit,
	onRemove,
}: {
	pet: Pet;
	onEdit: (pet: Pet) => void;
	onRemove: (pet: Pet) => void;
}) {
	const [notesExpanded, setNotesExpanded] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);

	return (
		<div
			className={cn(
				"group relative flex flex-col rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-black/5 hover:border-border hover:-translate-y-0.5 dark:hover:shadow-black/20",
				notesExpanded ? "h-auto" : PET_CARD_HEIGHT
			)}
		>
			{/* Decoração sutil no topo */}
			<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

			<div className="flex min-h-0 flex-1 flex-col p-5">
				<div className="flex min-h-0 flex-1 gap-4">
					<PetAvatar pet={pet} />

					<div className="flex min-w-0 flex-1 flex-col">
						<div className="flex items-start justify-between gap-2 shrink-0">
							<div className="min-w-0">
								<h3 className="font-semibold text-base text-foreground leading-tight truncate">
									{pet.name}
								</h3>
								<p className="text-sm text-muted-foreground mt-0.5 truncate">
									{pet.breed}
								</p>
							</div>

							<button
								onClick={() => onEdit(pet)}
								className="shrink-0 w-8 h-8 rounded-xl border border-border/50 bg-muted/40 flex items-center justify-center text-muted-foreground opacity-0 pointer-coarse:opacity-100 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/5 hover:border-primary/30 hover:text-primary focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
								aria-label={`Editar ${pet.name}`}
							>
								<Edit2 className="w-3.5 h-3.5" />
							</button>
						</div>

						<div className="flex items-center gap-2 mt-3 flex-wrap shrink-0">
							<SizeBadge size={pet.size} />
							<span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
								<Dog className="w-3 h-3" />
								{pet.age} {pet.age === 1 ? "ano" : "anos"}
							</span>
							<span className={cn(
								"inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
								pet.gender === "male"
									? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
									: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20"
							)}>
								{pet.gender === "male" ? "♂ Macho" : "♀ Fêmea"}
							</span>
						</div>

						<div className="mt-auto pt-3">
							<PetNotes notes={pet.notes} onExpandedChange={setNotesExpanded} />
						</div>
					</div>
				</div>
			</div>

			<div className="shrink-0 border-t border-border/40 px-5 py-3 bg-muted/20">
				{confirmingDelete ? (
					<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-2.5">
						<div className="flex items-center gap-2 text-sm text-destructive">
							<AlertCircle className="w-4 h-4 shrink-0" />
							<span className="font-medium">Remover {pet.name}?</span>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<button
								type="button"
								onClick={() => setConfirmingDelete(false)}
								className="relative rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors cursor-pointer after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-full after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={() => { setConfirmingDelete(false); onRemove(pet); }}
								className="relative rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-full after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']"
							>
								Sim, remover
							</button>
						</div>
					</div>
				) : (
					<div className="flex items-center justify-between">
						<button
							onClick={() => setConfirmingDelete(true)}
							className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-destructive transition-colors font-medium cursor-pointer"
						>
							<Trash2 className="w-3 h-3" />
							Remover
						</button>
						<button
							onClick={() => onEdit(pet)}
							className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary transition-colors font-medium cursor-pointer"
						>
							Editar dados
							<ChevronRight className="w-3 h-3" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export function PetsList() {
	const { data: session } = useSession();
	const { data: pets = [], isLoading } = useDogs();
	const { mutate: addDog } = useAddDog();
	const { mutate: updateDog } = useUpdateDog();
	const { mutate: removeDog } = useRemoveDog();

	const [sheetOpen, setSheetOpen] = useState(false);
	const [editingPet, setEditingPet] = useState<Pet | null>(null);
	const [sheetVersion, setSheetVersion] = useState(0);

	const router = useRouter();
	const searchParams = useSearchParams();

	const list = pets;

	const handleEdit = (pet: Pet) => {
		setEditingPet(pet);
		setSheetVersion((c) => c + 1);
		setSheetOpen(true);
	};

	const handleAdd = () => {
		setEditingPet(null);
		setSheetVersion((c) => c + 1);
		setSheetOpen(true);
	};

	useEffect(() => {
		const editId = searchParams.get("edit");
		const shouldAdd = searchParams.get("add") === "true";

		if (shouldAdd) {
			handleAdd();
		} else if (editId) {
			const pet = list.find((p) => p.id === editId);
			if (pet) handleEdit(pet);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleRemove = (pet: Pet) => {
		removeDog(pet.id, {
			onSuccess: () => toast.success(`${pet.name} removido com sucesso.`),
		});
	};

	const handleSheetOpenChange = (open: boolean) => {
		setSheetOpen(open);
		if (!open) router.replace("/dogs", { scroll: false });
	};

	const handleSavePet = (savedPet: PetDraft) => {
		if (editingPet) {
			updateDog({
				id: editingPet.id,
				data: {
					name: savedPet.name,
					breed: savedPet.breed,
					age: savedPet.age,
					size: savedPet.size,
					gender: savedPet.gender,
					notes: savedPet.behavior,
					photoUrl: savedPet.photoUrl,
				},
			});
			return;
		}

		addDog({
			ownerId: session?.user?.id ?? "",
			name: savedPet.name,
			breed: savedPet.breed,
			age: savedPet.age,
			size: savedPet.size,
			gender: savedPet.gender,
			notes: savedPet.behavior,
			photoUrl: savedPet.photoUrl,
		});
	};

	return (
		<div className="space-y-5">
			{/* Header da seção com contador e ação */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					{list.length > 0 && (
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">
								{list.length} {list.length === 1 ? "cão cadastrado" : "cães cadastrados"}
							</span>
							<div className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
						</div>
					)}
				</div>

				<div className="flex justify-end">
					<Button onClick={handleAdd}>
						<Plus className="h-4 w-4 mr-2" />
						Adicionar Novo Cão
					</Button>
				</div>
			</div>

			{/* Grid de cards — duas colunas quando há espaço na área principal */}
			<div
				className={cn(
					"grid gap-4",
					list.length > 0 && !isLoading
						? "grid-cols-1 xl:grid-cols-2"
						: "grid-cols-1"
				)}
			>
				{isLoading ? (
					<>
						<SkeletonCard />
						<SkeletonCard />
					</>
				) : list.length === 0 ? (
					<EmptyState onAdd={handleAdd} />
				) : (
					list.map((pet, index) => (
						<div
							key={pet.id}
							style={{ animationDelay: `${index * 60}ms` }}
							className="animate-in fade-in slide-in-from-bottom-2 duration-400 min-w-0"
						>
							<PetCard pet={pet} onEdit={handleEdit} onRemove={handleRemove} />
						</div>
					))
				)}
			</div>

			<PetFormSheet
				key={`${editingPet?.id ?? "new"}-${sheetVersion}`}
				open={sheetOpen}
				onOpenChange={handleSheetOpenChange}
				petToEdit={editingPet ? toDraft(editingPet) : null}
				onSave={handleSavePet}
			/>
		</div>
	);
}
