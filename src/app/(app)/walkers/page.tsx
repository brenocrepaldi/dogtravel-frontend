import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { WalkersExplorer } from "./_components/walkers-explorer";
import { PickWalkerBar } from "./_components/pick-walker-bar";

export const metadata: Metadata = { title: "Passeadores | DogTravel" };

export default async function WalkersPage({
  searchParams,
}: {
  searchParams: Promise<{ pick?: string }>;
}) {
  // ?pick=1: the client came from step 1 of a walk request to choose who gets it.
  const pickMode = (await searchParams).pick === "1";

  return (
    <div className="flex flex-col gap-5 pb-8 lg:gap-8">
      {pickMode && <PickWalkerBar />}
      <header className="space-y-1.5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            Passeadores parceiros
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Encontre passeadores verificados com experiência comprovada e porte compatível com seu cão.
          </p>
        </div>
        <Separator className="mt-6 hidden lg:block" />
      </header>

      <WalkersExplorer pickMode={pickMode} />
    </div>
  );
}
