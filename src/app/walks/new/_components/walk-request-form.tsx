'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BadgeCheck, CheckCircle2, LogOut, User } from 'lucide-react';
import { useDogs } from '@/features/dogs/hooks/use-dogs';
import { useCreateWalk } from '@/features/walks/hooks/use-walk-actions';
import { useWalkById } from '@/features/walks/hooks/use-walks';
import { useWalkerById } from '@/features/walkers/hooks/use-walkers';
import { trackMetricEvent } from '@/lib/metrics';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

import { StepPets } from './steps/step-pets';
import { StepDateTime } from './steps/step-datetime';
import { StepLocation } from './steps/step-location';
import { StepPrice } from './steps/step-price';
import { StepPayment } from './steps/step-payment';
import { StepConfirm } from './steps/step-confirm';
import { StepPixPayment } from './steps/step-pix-payment';
import { PIX_INSTANT_ID } from '@/config/pricing';
import type { CreateWalkDto } from '@/types';

// ─── Form state shape ──────────────────────────────────────────────────────
export interface WalkFormData {
	selectedPetIds: string[];
	date: string;
	time: string;
	durationMinutes: number;
	// Individual address fields (user fills these)
	addressStreet: string; // logradouro + número
	addressComplement: string; // complemento (optional)
	addressNeighborhood: string; // bairro (optional but improves geocoding)
	addressCity: string; // cidade (required)
	// Combined address derived from the fields above; used for geocoding & backend
	address: string;
	lat: number | null;
	lng: number | null;
	estimatedPrice: number | null;
	selectedMethodId: string | null;
	isFirstRide: boolean;
	notes: string;
	// Pre-selected walker (from ?walker=ID query param on /walkers/{id} page)
	selectedWalkerId: string | null;
}

const INITIAL_DATA: WalkFormData = {
	selectedPetIds: [],
	date: '',
	time: '',
	durationMinutes: 30,
	addressStreet: '',
	addressComplement: '',
	addressNeighborhood: '',
	addressCity: '',
	address: '',
	lat: null,
	lng: null,
	estimatedPrice: null,
	selectedMethodId: null,
	isFirstRide: true,
	notes: "",
	selectedWalkerId: null,
};

function toDateAndTime(iso: string) {
	const dateTime = new Date(iso);
	const localDateTime = new Date(dateTime.getTime() - dateTime.getTimezoneOffset() * 60000);
	const [date, time] = localDateTime.toISOString().split('T') as [string, string];
	return { date, time: time.slice(0, 5) };
}

// ─── Step definitions ──────────────────────────────────────────────────────
const STEPS = [
	{ label: 'Seus cães' },
	{ label: 'Data e horário' },
	{ label: 'Local de partida' },
	{ label: 'Estimativa de preço' },
	{ label: 'Pagamento' },
	{ label: 'Confirmar pedido' },
];

// ─── Step indicator ────────────────────────────────────────────────────────
function StepIndicator({
	currentStep,
	maxStep,
	onStepClick,
}: {
	currentStep: number;
	maxStep: number;
	onStepClick: (step: number) => void;
}) {
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
						Passo {currentStep + 1} de {STEPS.length}
					</p>
					<p className="text-lg font-semibold text-foreground mt-0.5">{STEPS[currentStep]?.label}</p>
				</div>
			</div>

			{/* Segmented progress bar */}
			<div className="flex gap-1">
				{STEPS.map((step, i) => {
					const isCurrent   = i === currentStep;
					const isVisited   = i <= maxStep && !isCurrent; // already filled, clickable
					const isFuture    = i > maxStep;                // not yet reached

					return (
						<button
							key={i}
							type="button"
							disabled={!isVisited}
							onClick={() => isVisited && onStepClick(i)}
							title={isVisited ? step.label : undefined}
							className={cn(
								'h-1.5 flex-1 rounded-full transition-all duration-500 self-center',
								isVisited
									? 'bg-primary cursor-pointer hover:bg-primary/70 hover:h-2.5'
									: isCurrent
										? 'bg-primary/40 cursor-default'
										: isFuture
											? 'bg-border/60 cursor-default'
											: 'bg-border/60 cursor-default',
							)}
						/>
					);
				})}
			</div>
		</div>
	);
}

// ─── Main form component ───────────────────────────────────────────────────
export function WalkRequestForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const repeatWalkId  = searchParams.get('repeat') ?? '';
	const preselectedWalkerId = searchParams.get('walker') ?? '';
	const { data: pets = [] } = useDogs();
	const { data: walkToRepeat } = useWalkById(repeatWalkId);
	const { data: preselectedWalker } = useWalkerById(preselectedWalkerId);
	const { mutateAsync: createWalk } = useCreateWalk();
	const [step,    setStep]    = useState(0);
	const [maxStep, setMaxStep] = useState(0);
	const [data, setData] = useState<WalkFormData>({
		...INITIAL_DATA,
		selectedWalkerId: preselectedWalkerId || null,
	});
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [pixPayment, setPixPayment] = useState(false);
	const hasPrefilledRepeat = useRef(false);

	useEffect(() => {
		if (hasPrefilledRepeat.current) return;
		if (!repeatWalkId || !walkToRepeat) return;
		hasPrefilledRepeat.current = true;
		const { date, time } = toDateAndTime(walkToRepeat.scheduledAt);

		// Prefer petIds from the walk record (reliable); fall back to name matching
		// for walks created before this field was added.
		const ownedPetIds = new Set(pets.map((p) => p.id));
		const selectedPetIds = walkToRepeat.petIds
			? walkToRepeat.petIds.filter((id) => ownedPetIds.has(id))
			: walkToRepeat.petNames
					.map((name) => pets.find((p) => p.name.toLowerCase() === name.toLowerCase())?.id)
					.filter((id): id is string => Boolean(id));

		setData((previous) => ({
			...previous,
			selectedPetIds: selectedPetIds.length > 0 ? selectedPetIds : previous.selectedPetIds,
			durationMinutes: walkToRepeat.durationMinutes,
			date,
			time,
			address: walkToRepeat.startAddress,
			isFirstRide: false,
			estimatedPrice: null,
		}));
		toast('Dados do ultimo passeio carregados', {
			description: 'Revise os detalhes e confirme quando quiser.',
		});
		trackMetricEvent({
			name: 'walk_repeat_prefill_used',
			payload: { walkId: walkToRepeat.id },
		});
	}, [walkToRepeat, pets, repeatWalkId]);

	function updateData(partial: Partial<WalkFormData>) {
		setData((prev) => ({ ...prev, ...partial }));
	}

	function next() {
		if (step < STEPS.length - 1) {
			const next = step + 1;
			setStep(next);
			setMaxStep((m) => Math.max(m, next));
		}
	}

	function back() {
		if (step > 0) setStep((s) => s - 1);
	}

	function goToStep(target: number) {
		if (target !== step && target <= maxStep) setStep(target);
	}

	async function handleSubmit() {
		const paymentMethodId = data.selectedMethodId ?? '';
		if (!paymentMethodId) {
			toast.error('Selecione uma forma de pagamento antes de concluir.');
			return;
		}

		setSubmitting(true);

		const scheduledAt = new Date(`${data.date}T${data.time || '00:00'}:00`).toISOString();
		const petNames = pets
			.filter((p) => data.selectedPetIds.includes(p.id))
			.map((p) => p.name);

		const dto: CreateWalkDto = {
			petIds: data.selectedPetIds,
			petNames,
			scheduledAt,
			durationMinutes: data.durationMinutes,
			price: data.estimatedPrice ?? 0,
			startAddress: data.address,
			paymentMethodId,
			walkerId: data.selectedWalkerId ?? undefined,
			lat: data.lat ?? undefined,
			lng: data.lng ?? undefined,
			notes: data.notes || undefined,
		};

		await createWalk(dto);

		trackMetricEvent({
			name: 'walk_request_submitted',
			payload: {
				petCount: data.selectedPetIds.length,
				durationMinutes: data.durationMinutes,
				isFirstRide: data.isFirstRide,
			},
		});

		setSubmitting(false);
		setSubmitted(true);

		if (data.selectedMethodId === PIX_INSTANT_ID) {
			setPixPayment(true);
		} else {
			setShowSuccess(true);
			setTimeout(() => router.push('/walks'), 2200);
		}
	}

	// ── Exit guard ────────────────────────────────────────────────────────────
	const [showExitModal, setShowExitModal] = useState(false);
	const [pendingUrl, setPendingUrl] = useState<string | null>(null);

	const isDirty =
		!submitted &&
		(step > 0 || data.selectedPetIds.length > 0 || data.date !== '' || data.addressStreet !== '');

	// Intercept browser close / tab refresh
	useEffect(() => {
		if (!isDirty) return;
		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = '';
		};
		window.addEventListener('beforeunload', handler);
		return () => window.removeEventListener('beforeunload', handler);
	}, [isDirty]);

	// Intercept browser back button
	useEffect(() => {
		if (!isDirty) return;
		window.history.pushState({ walkGuard: true }, '');
		const handler = () => {
			window.history.pushState({ walkGuard: true }, '');
			setPendingUrl(null);
			setShowExitModal(true);
		};
		window.addEventListener('popstate', handler);
		return () => window.removeEventListener('popstate', handler);
	}, [isDirty]);

	// Intercept Next.js Link clicks (sidebar + any <a> going to another route)
	useEffect(() => {
		if (!isDirty) return;

		const handleClick = (e: MouseEvent) => {
			// Let modified clicks through (Ctrl/Cmd = new tab, etc.)
			if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

			const anchor = (e.target as HTMLElement).closest('a');
			if (!anchor) return;

			const href = anchor.getAttribute('href');
			if (!href) return;

			try {
				const dest = new URL(href, window.location.origin);
				// Ignore external links or same-page navigation
				if (dest.origin !== window.location.origin) return;
				if (dest.pathname === window.location.pathname) return;
			} catch {
				return;
			}

			// Block the click before Next.js processes it
			e.preventDefault();
			e.stopPropagation();
			setPendingUrl(href);
			setShowExitModal(true);
		};

		// Capture phase — fires before Next.js Link's own handler
		document.addEventListener('click', handleClick, true);
		return () => document.removeEventListener('click', handleClick, true);
	}, [isDirty]);

	function confirmExit() {
		setShowExitModal(false);
		router.push(pendingUrl ?? '/walks');
		setPendingUrl(null);
	}

	const stepProps = { data, updateData, onNext: next, onBack: back };

	return (
		<div className="w-full max-w-2xl mx-auto space-y-6 pb-10">
			{/* Page header */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-foreground">Solicitar passeio</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Preencha os detalhes para encontrar o passeador ideal.
				</p>
			</div>

			{/* Success overlay */}
			{showSuccess && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
					<div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
						<div className="relative">
							<div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center animate-in zoom-in duration-500">
								<CheckCircle2 className="w-14 h-14 text-emerald-500" strokeWidth={1.5} />
							</div>
							<div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping" />
						</div>
						<div className="text-center space-y-1">
							<p className="text-xl font-bold text-foreground">Passeio solicitado!</p>
							<p className="text-sm text-muted-foreground">Aguardando aceitação de um passeador.</p>
						</div>
					</div>
				</div>
			)}

			{/* Walker pre-selection banner */}
			{preselectedWalker && (
				<div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
						<User className="h-4 w-4" />
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-1.5">
							<p className="text-sm font-semibold text-foreground truncate">{preselectedWalker.name}</p>
							{preselectedWalker.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />}
						</div>
						<p className="text-xs text-muted-foreground mt-0.5">Passeador selecionado · {preselectedWalker.location}</p>
					</div>
				</div>
			)}

			{pixPayment ? (
				/* PIX payment screen — replaces step flow after submission */
				<Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
					<div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
					<CardContent className="p-6">
						<StepPixPayment data={data} onDone={() => router.push('/walks')} />
					</CardContent>
				</Card>
			) : (
				<>
					{/* Step indicator */}
					<StepIndicator currentStep={step} maxStep={maxStep} onStepClick={goToStep} />

					{/* Step card — key forces remount + animation on step change */}
					<Card
						key={step}
						className="overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
					>
						<div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
						<CardContent className="p-6">
							{step === 0 && <StepPets {...stepProps} onCancel={() => setShowExitModal(true)} />}
							{step === 1 && <StepDateTime {...stepProps} />}
							{step === 2 && <StepLocation {...stepProps} />}
							{step === 3 && <StepPrice {...stepProps} />}
							{step === 4 && <StepPayment {...stepProps} />}
							{step === 5 && (
								<StepConfirm {...stepProps} onSubmit={handleSubmit} submitting={submitting} />
							)}
						</CardContent>
					</Card>
				</>
			)}

			{/* Exit confirmation modal */}
			<Dialog open={showExitModal} onOpenChange={(open) => !open && setShowExitModal(false)}>
				<DialogContent showCloseButton={false} className="max-w-sm">
					<DialogHeader>
						<div className="flex items-center gap-3 mb-1">
							<div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
								<LogOut className="h-5 w-5 text-destructive" />
							</div>
							<DialogTitle className="text-base font-semibold">Sair do pedido?</DialogTitle>
						</div>
						<DialogDescription className="text-sm leading-relaxed">
							O progresso feito até aqui será perdido e o pedido não será salvo.
						</DialogDescription>
					</DialogHeader>
					{/* Custom footer — flex-col keeps safe action on top on mobile */}
					<div className="-mx-4 -mb-4 flex flex-col gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
						<Button
							variant="ghost"
							className="cursor-pointer"
							onClick={() => setShowExitModal(false)}
						>
							Continuar pedido
						</Button>
						<Button variant="destructive" className="cursor-pointer" onClick={confirmExit}>
							Sair sem salvar
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
