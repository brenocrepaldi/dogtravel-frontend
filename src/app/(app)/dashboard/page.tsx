import { auth } from "@/lib/auth";
import WalkerDashboardPage from "./_walker/page";
import ClientDashboardPage from "./_client/page";

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "client";

  if (role === "walker") return <WalkerDashboardPage />
  return <ClientDashboardPage />
}
