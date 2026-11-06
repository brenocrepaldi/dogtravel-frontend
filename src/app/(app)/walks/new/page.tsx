import type { Metadata } from "next";
import { WalkRequestForm } from "./_components/walk-request-form";

export const metadata: Metadata = { title: "Solicitar Passeio" };

export default function NewWalkPage() {
  return <WalkRequestForm />;
}
