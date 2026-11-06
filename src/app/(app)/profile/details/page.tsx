import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ProfileInfo } from "../_components/profile-info";

export const metadata: Metadata = {
  title: "Informações pessoais | DogTravel",
};

export default async function ProfileDetailsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-2xl space-y-6 pb-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          aria-label="Voltar ao perfil"
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent/60 transition-colors text-muted-foreground hover:text-foreground shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Informações pessoais</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie seus dados de contato.</p>
        </div>
      </div>

      {/* Profile form */}
      <ProfileInfo />

      {/* Security footer */}
      <div className="rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Seus dados estão seguros</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            Suas informações são usadas apenas para facilitar o contato com passeadores.
            Nunca compartilhamos seus dados com terceiros.
          </p>
        </div>
      </div>

    </div>
  );
}
