import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { WalkerDocuments } from "./_components/walker-documents";

export const metadata: Metadata = {
  title: "Perfil Profissional | DogTravel",
};

export default async function WalkerDocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role?: string })?.role ?? "client";
  if (role !== "walker") redirect("/profile");

  return (
    <div className="max-w-2xl space-y-4 pb-8 md:space-y-6">

      {/* Header — phones: compact title for the list layout; md+: the original header. */}
      <div className="flex items-center gap-1 md:hidden">
        <Link
          href="/profile"
          aria-label="Voltar ao perfil"
          className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors active:bg-accent/60"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Documentos</h1>
          <p className="text-sm text-muted-foreground">Verificação e certificações</p>
        </div>
      </div>

      <div className="max-md:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            aria-label="Voltar ao perfil"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground max-md:-ml-2 max-md:size-11"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Perfil Profissional
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Complete os requisitos obrigatórios e destaque suas credenciais.
            </p>
          </div>
        </div>
        <Separator className="mt-4 md:mt-6" />
      </div>

      <WalkerDocuments />

    </div>
  );
}
