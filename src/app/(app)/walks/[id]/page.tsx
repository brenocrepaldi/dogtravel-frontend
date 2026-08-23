import type { Metadata } from "next";
import { WalkDetailClient } from "./_components/walk-detail-client";

export const metadata: Metadata = { title: "Detalhe do Passeio | DogTravel" };

export default async function WalkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WalkDetailClient walkId={id} />;
}
