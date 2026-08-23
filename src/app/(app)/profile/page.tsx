import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Briefcase, Building2, ChevronRight, CreditCard, FileCheck2, TrendingUp, WalletCards } from 'lucide-react';
import { LogoutButton } from './_components/logout-button';
import { ProfileAvatar } from './_components/profile-avatar';


interface NavItemProps {
	href: string;
	icon: React.ElementType;
	label: string;
	description: string;
}

function NavItem({ href, icon: Icon, label, description }: NavItemProps) {
	return (
		<Link
			href={href}
			className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/50 transition-colors duration-150 group"
		>
			<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
				<Icon className="w-4 h-4 text-primary" />
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold text-foreground">{label}</p>
				<p className="text-xs text-muted-foreground">{description}</p>
			</div>
			<ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
		</Link>
	);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1.5">
			{children}
		</p>
	);
}

export default async function ProfilePage() {
	const session = await auth();
	if (!session?.user) redirect('/login');

	const { name, email, image, role = 'client' } = session.user;

	return (
		<div className="max-w-xl space-y-6 pb-8">
			<header className="space-y-1.5">
				<div className="flex items-center gap-3">
					<div>
						<h1 className="text-3xl font-bold tracking-tight text-foreground">Perfil</h1>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Gerencie suas informações de perfil e preferências.
						</p>
					</div>
				</div>
				<Separator className="mt-6" />
			</header>
			{/* Identity card */}
			<Link
				href="/profile/details"
				className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-accent/40 transition-colors duration-150 group"
			>
				<ProfileAvatar
					fallbackName={name ?? ''}
					fallbackImage={image ?? undefined}
				/>
				<div className="flex-1 min-w-0">
					<p className="text-base font-semibold text-foreground truncate">{name ?? 'Usuário'}</p>
					<p className="text-sm text-muted-foreground truncate">{email ?? ''}</p>
					<p className="text-xs text-primary mt-0.5 font-medium">Ver e editar informações</p>
				</div>
				<ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
			</Link>

			{/* Profissional — somente para passeadores */}
			{role === 'walker' && (
				<div>
					<SectionLabel>Profissional</SectionLabel>
					<Card className="overflow-hidden py-0 gap-0">
						<CardContent className="p-0 divide-y divide-border/60">
							<NavItem
								href="/profile/walker-profile"
								icon={Briefcase}
								label="Perfil profissional"
								description="Descrição, área de atendimento e especialidades"
							/>
							<NavItem
								href="/profile/documents"
								icon={FileCheck2}
								label="Documentos profissionais"
								description="Identidade, antecedentes e certificações"
							/>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Financeiro */}
			<div>
				<SectionLabel>Financeiro</SectionLabel>
				<Card className="overflow-hidden py-0 gap-0">
					<CardContent className="p-0 divide-y divide-border/60">
						{role === 'walker' ? (
							<>
								<NavItem
									href="/profile/payments"
									icon={TrendingUp}
									label="Ganhos"
									description="Histórico de recebimentos"
								/>
								<NavItem
									href="/profile/bank-account"
									icon={Building2}
									label="Dados bancários"
									description="Conta para recebimento de pagamentos"
								/>
							</>
						) : (
							<>
								<NavItem
									href="/profile/payments"
									icon={CreditCard}
									label="Pagamentos"
									description="Histórico de transações"
								/>
								<NavItem
									href="/profile/payment-methods"
									icon={WalletCards}
									label="Métodos de pagamento"
									description="Cartões e chaves PIX salvos"
								/>
							</>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Conta */}
			<div>
				<SectionLabel>Conta</SectionLabel>
				<Card className="overflow-hidden py-0 gap-0">
					<CardContent className="p-0">
						<LogoutButton />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
