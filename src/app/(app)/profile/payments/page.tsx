import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClientPayments } from "@/app/(app)/payments/_components/client-payments";
import { WalkerPayments } from "@/app/(app)/payments/_components/walker-payments";

export const metadata: Metadata = {
  title: "Pagamentos | DogTravel",
};

export default async function ProfilePaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return session.user.role === "walker" ? <WalkerPayments /> : <ClientPayments />;
}
