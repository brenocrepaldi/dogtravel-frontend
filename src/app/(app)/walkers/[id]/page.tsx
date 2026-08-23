import type { Metadata } from 'next';
import type { ElementType } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
	ArrowLeft,
	Award,
	Calendar,
	CalendarClock,
	CheckCircle2,
	Clock3,
	FileCheck2,
	MapPin,
	ShieldCheck,
	Star,
	Target,
	XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WalkerHero, walkerGradient, walkerInitials } from '@/components/walkers/walker-hero';
import { TrustItemCard } from '@/components/walkers/trust-item-card';
import { WalkersApi } from '@/features/walkers/api/walkers.api';
import { DAYS } from '@/lib/availability';
import type { DogSize } from '@/types';
import { Separator } from '@/components/ui/separator';
import { WalkerReviewsSection } from './_components/walker-reviews-section';
import { WalkerAvailabilityBadge } from './_components/walker-availability-badge';

export const metadata: Metadata = { title: 'Perfil do Passeador | DogTravel' };

const SIZE_LABEL: Record<DogSize, string> = {
	small: 'Pequeno',
	medium: 'Médio',
	large: 'Grande',
	giant: 'Gigante',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
	icon: Icon,
	label,
	value,
	className,
}: {
	icon: ElementType;
	label: string;
	value: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'flex flex-col gap-1.5 rounded-xl border border-border/50 bg-card px-4 py-3.5',
				className,
			)}
		>
			<div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
				<Icon className="w-3.5 h-3.5 shrink-0" />
				{label}
			</div>
			<p className="text-sm font-semibold text-foreground leading-snug">{value}</p>
		</div>
	);
}

function SectionHeader({
	icon: Icon,
	iconColor = 'text-primary',
	iconBg = 'bg-primary/10',
	title,
	description,
}: {
	icon: ElementType;
	iconColor?: string;
	iconBg?: string;
	title: string;
	description: string;
}) {
	return (
		<CardHeader className="pt-5">
			<div className="flex items-center gap-2.5">
				<div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
					<Icon className={cn('w-4 h-4', iconColor)} />
				</div>
				<div>
					<CardTitle className="text-sm font-semibold">{title}</CardTitle>
					<CardDescription className="text-xs mt-0.5">{description}</CardDescription>
				</div>
			</div>
		</CardHeader>
	);
}

function SidebarAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
	if (avatarUrl) {
		return (
			<div className="relative w-10 h-10 rounded-xl shrink-0 ring-2 ring-border/30 overflow-hidden">
				<Image src={avatarUrl} alt={name} fill sizes="40px" className="object-cover" />
			</div>
		);
	}
	return (
		<div
			className={cn(
				'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 ring-2 ring-border/30',
				walkerGradient(name),
			)}
		>
			<span className="text-sm font-bold text-foreground/70">{walkerInitials(name)}</span>
		</div>
	);
}

function SidebarTrustRow({ verified, label }: { verified: boolean; label: string }) {
	return (
		<div className="flex items-center gap-2.5">
			<div
				className={cn(
					'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
					verified ? 'bg-emerald-100 dark:bg-emerald-950/50' : 'bg-muted',
				)}
			>
				{verified ? (
					<CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
				) : (
					<XCircle className="w-3 h-3 text-muted-foreground/40" />
				)}
			</div>
			<span
				className={cn(
					'text-xs',
					verified ? 'text-foreground' : 'text-muted-foreground/60 line-through',
				)}
			>
				{label}
			</span>
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function WalkerDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const walker = await WalkersApi.getById(id);

	if (!walker) notFound();

	const specialtyLabels = Array.from(
		new Set([
			...walker.tags,
			...walker.behaviorExpertise
				.filter((e) => e === 'multiplos-caes')
				.map(() => 'Passeio com mais de um cão'),
		]),
	);

	const joinedDate = walker.joinedAt
		? new Date(walker.joinedAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
		: undefined;


	return (
		<div className="flex flex-col gap-6 pb-10">
			{/* Back */}
			<Link
				href="/walkers"
				className={cn(
					buttonVariants({ variant: 'ghost', size: 'sm' }),
					'-ml-2 self-start text-muted-foreground hover:text-foreground',
				)}
			>
				<ArrowLeft className="mr-1.5 h-4 w-4" />
				Todos os passeadores
			</Link>

			{/* Two-column layout */}
			<div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10">
				{/* ── Main content ── */}
				<div className="flex min-w-0 flex-1 flex-col gap-6">
					{/* Hero */}
					<Card className="overflow-hidden">
						<div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
						<CardContent className="p-6">
							<WalkerHero
								name={walker.name}
								avatarUrl={walker.avatarUrl}
								description={walker.description}
								rating={walker.rating}
								reviews={walker.reviews}
								location={walker.location}
								verified={walker.verified}
								availability={walker.availability}
								joinedDate={joinedDate}
							/>
						</CardContent>
					</Card>

					{/* Stats */}
					<div className="grid grid-cols-2 gap-3">
						<StatCard icon={MapPin} label="Área de atendimento" value={walker.serviceArea} />
						<StatCard
							icon={Clock3}
							label="Passeios realizados"
							value={`${walker.completedWalks}+`}
						/>
					</div>

					{/* Horários disponíveis */}
					<Card className="overflow-hidden pt-1">
						<SectionHeader
							icon={CalendarClock}
							title="Horários disponíveis"
							description="Dias e janelas de horário abertas para novas reservas"
						/>
						<Separator />
						<CardContent className="py-5">
							{walker.availability.filter((s) => s.start && s.end).length === 0 ? (
								<p className="text-sm text-muted-foreground">Horários não configurados.</p>
							) : (
								<div className="space-y-2">
									{DAYS.filter((d) =>
										walker.availability.some((s) => s.day === d.key && s.start && s.end),
									).map((d) => {
										const entry = walker.availability.find((s) => s.day === d.key)!;
										return (
											<div key={d.key} className="flex items-center gap-3">
												<span className="w-8 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
													{d.short}
												</span>
												<span className="rounded-md border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium tabular-nums">
													{entry.start} – {entry.end}
												</span>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Especialidades */}
					<Card className="overflow-hidden pt-1">
						<SectionHeader
							icon={Target}
							title="Especialidades"
							description="Áreas de atuação e portes atendidos"
						/>
						<Separator />
						<CardContent className="pb-5 space-y-4">
							<div className="flex flex-wrap gap-2">
								{specialtyLabels.map((tag) => (
									<Badge key={tag} variant="secondary" className="text-xs font-normal px-2.5 py-1">
										{tag}
									</Badge>
								))}
							</div>
							<div>
								<p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
									Portes atendidos
								</p>
								<div className="flex flex-wrap gap-1.5">
									{walker.supportedSizes.map((size) => (
										<Badge
											key={size}
											variant="outline"
											className="text-[11px] text-muted-foreground"
										>
											{SIZE_LABEL[size]}
										</Badge>
									))}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Trust & Security */}
					<Card className="overflow-hidden pt-1">
						<SectionHeader
							icon={ShieldCheck}
							iconBg="bg-emerald-500/10"
							iconColor="text-emerald-600 dark:text-emerald-400"
							title="Confiança e Segurança"
							description="Critérios de qualidade verificados pela DogTravel"
						/>
						<Separator />
						<CardContent className="pb-5 space-y-3">
							<TrustItemCard
								icon={ShieldCheck}
								label="Identidade validada"
								value={
									walker.trustChecks.identityVerified
										? 'Documento e selfie confirmados'
										: 'Em revisão'
								}
								verified={walker.trustChecks.identityVerified}
							/>
							<TrustItemCard
								icon={FileCheck2}
								label="Antecedentes Criminais"
								value={
									walker.trustChecks.backgroundCheck
										? 'Checagem concluída e aprovada'
										: 'Em revisão'
								}
								verified={walker.trustChecks.backgroundCheck}
							/>
						</CardContent>
					</Card>

					{/* Certifications */}
					{walker.certifications.length > 0 && (
						<Card className="overflow-hidden pt-1">
							<SectionHeader
								icon={Award}
								title="Credenciais e Certificados"
								description="Formações e treinamentos apresentados por este profissional"
							/>
							<Separator />
							<CardContent className="pb-5 space-y-3">
								{walker.certifications.map((cert) => (
									<TrustItemCard
										key={cert.title}
										icon={Award}
										label={cert.title}
										value={cert.verified ? 'Verificado pela DogTravel' : 'Aguardando verificação'}
										verified={cert.verified}
										accent={cert.verified ? 'cyan' : 'amber'}
									/>
								))}
							</CardContent>
						</Card>
					)}

					{/* Reviews */}
					<WalkerReviewsSection walkerId={id} />

					{/* Bottom CTA banner */}
					<div className="rounded-2xl border border-primary/15 bg-primary/5 px-5 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center gap-5">
						<div className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center shrink-0 hidden sm:flex">
							<CalendarClock className="w-5 h-5 text-primary" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="font-semibold text-foreground text-sm">Pronto para agendar?</p>
							<p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
								Reserve um horário com {walker.name} e garanta o melhor cuidado para o seu cão.
							</p>
						</div>
						<Link
							href={`/walks/new?walker=${walker.id}`}
							className={cn(buttonVariants({ size: 'xl' }), 'shrink-0 shadow-sm')}
						>
							Agendar passeio
						</Link>
					</div>
				</div>

				{/* ── Sidebar: booking panel ── */}
				<aside className="w-full shrink-0 lg:w-80 lg:sticky lg:top-8 lg:self-start">
					<Card className="overflow-hidden">
						<div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
						<CardContent className="p-5 space-y-4">
							{/* Mini perfil */}
							<div className="flex items-center gap-3">
								<SidebarAvatar name={walker.name} avatarUrl={walker.avatarUrl} />
								<div className="min-w-0">
									<p className="font-semibold text-sm text-foreground truncate">{walker.name}</p>
									<div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
										<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
										<span className="font-semibold text-foreground">{walker.rating.toFixed(1)}</span>
										<span>· {walker.reviews} avaliações</span>
									</div>
								</div>
							</div>

							<div className="h-px bg-border/40" />

							{/* CTA */}
							<div className="space-y-2">
								<Link
									href={`/walks/new?walker=${walker.id}`}
									className={cn(buttonVariants({ size: 'xl' }), 'w-full shadow-sm')}
								>
									<CalendarClock className="w-4 h-4 mr-2 shrink-0" />
									Agendar passeio com {walker.name.split(' ')[0]}
								</Link>
								<p className="text-center text-[11px] text-muted-foreground leading-relaxed">
									Escolha data, horário e pets na próxima etapa
								</p>
							</div>

							{/* Disponibilidade real-time */}
							<WalkerAvailabilityBadge walkerId={walker.id} scheduleLabel={walker.availability} />

							<div className="h-px bg-border/40" />

							{/* Verificações rápidas */}
							<div className="space-y-2.5">
								<p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
									Verificações
								</p>
								<SidebarTrustRow
									verified={walker.trustChecks.identityVerified}
									label="Identidade validada"
								/>
								<SidebarTrustRow
									verified={walker.trustChecks.backgroundCheck}
									label="Antecedentes checados"
								/>
								<SidebarTrustRow
									verified={walker.certifications.some((c) => c.verified)}
									label="Certificações comprovadas"
								/>
							</div>

							<div className="h-px bg-border/40" />

							{/* Link voltar */}
							<Link
								href="/walkers"
								className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
							>
								<ArrowLeft className="w-3.5 h-3.5" />
								Ver outros passeadores
							</Link>
						</CardContent>
					</Card>
				</aside>
			</div>
		</div>
	);
}
