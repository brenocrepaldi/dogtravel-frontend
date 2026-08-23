import type { Metadata } from "next";
import { auth } from "@/lib/auth";
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
    <div className="max-w-2xl space-y-6 pb-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            aria-label="Voltar ao perfil"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
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
        <Separator className="mt-6" />
      </div>

      <WalkerDocuments />

    </div>
  );
}
