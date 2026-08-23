import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClientMap } from "./_components/client-map";

export const metadata: Metadata = { title: "Acompanhar Passeio" };

export default async function WalkTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden rounded-2xl border border-border bg-background shadow-sm min-h-[500px]">
      {/* Map filling the area */}
      <ClientMap walkId={id} />
    </div>
  );
}
