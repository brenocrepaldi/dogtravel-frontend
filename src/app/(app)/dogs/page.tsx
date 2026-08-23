import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PetsList } from "./_components/pets-list";
import { Separator } from "@/components/ui/separator";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import {
	Dog,
	Lightbulb,
	ShieldCheck,
	Ruler,
	StickyNote,
	PlusCircle,
} from "lucide-react";

const QUICK_TIPS = [
	{
		icon: Dog,
		text: "Mantenha o nome e a raça atualizados.",
	},
	{
		icon: StickyNote,
		text: "Adicione notas sobre comportamento — medo, sociabilidade, restrições.",
	},
	{
		icon: Ruler,
		text: "Informe o porte correto para encontrar passeadores compatíveis.",
	},
	{
		icon: PlusCircle,
		text: (
			<>
				Use{" "}
				<strong className="text-foreground font-medium">Adicionar Cão</strong>{" "}
				para incluir novos pets a qualquer momento.
			</>
		),
	},
] as const;

function QuickTipsSidebar() {
	return (
		<Card className="overflow-hidden">
			<div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/40" />

			<CardHeader className="pb-2 pt-5">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
						<Lightbulb className="w-4 h-4 text-primary" />
					</div>
					<div>
						<CardTitle className="text-sm font-semibold">Dicas rápidas</CardTitle>
						<CardDescription className="text-xs mt-0.5">
							Mantenha os dados sempre atualizados
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pb-5">
				<ul className="space-y-3.5 mt-1">
					{QUICK_TIPS.map((tip, i) => {
						const Icon = tip.icon;
						return (
							<li key={i} className="flex items-start gap-3">
								<div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
									<Icon className="w-3.5 h-3.5" />
								</div>
								<p className="text-xs text-muted-foreground leading-relaxed">
									{tip.text}
								</p>
							</li>
						);
					})}
				</ul>
			</CardContent>
		</Card>
	);
}

function ProtectedDataFooter() {
	return (
		<footer className="pt-2">
			<div className="rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-4">
				<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
					<ShieldCheck className="w-4 h-4 text-primary" />
				</div>
				<div className="min-w-0">
					<p className="text-sm font-semibold text-foreground">Dados protegidos</p>
					<p className="text-xs text-muted-foreground leading-relaxed mt-1">
						As informações dos seus cães são usadas exclusivamente para encontrar
						passeadores compatíveis. Nunca compartilhamos seus dados com terceiros.
					</p>
				</div>
			</div>
		</footer>
	);
}

export default async function DogsPage() {
	const session = await auth();
	if (!session?.user) redirect("/login");

	const role = session.user.role || "client";
	if (role !== "client") return null;

	return (
		<div className="flex flex-col gap-8 pb-8 lg:flex-row lg:items-start lg:gap-10">
			<div className="flex min-w-0 flex-1 flex-col gap-8">
				<header className="space-y-1.5">
					<div className="flex items-center gap-3">
						<div>
							<h1 className="text-3xl font-bold tracking-tight text-foreground">
								Meus Cães
							</h1>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Gerencie os perfis dos seus cães.
							</p>
						</div>
					</div>
					<Separator className="mt-6" />
				</header>
				<section className="min-w-0">
					<Suspense>
						<PetsList />
					</Suspense>
				</section>

				<ProtectedDataFooter />
			</div>

			<aside className="w-full shrink-0 lg:w-72 lg:sticky lg:top-32 lg:self-start">
				<QuickTipsSidebar />
			</aside>
		</div>
	);
}
