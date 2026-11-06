import { auth } from "@/lib/auth/auth";
import WalkerDashboard from "./_walker/walker-dashboard";
import ClientDashboard from "./_client/client-dashboard";

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "client";

  if (role === "walker") return <WalkerDashboard />
  return <ClientDashboard />
}
