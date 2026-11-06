import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { Sidebar } from "@/app/(app)/_components/sidebar";
import { MobileTopBar } from "@/app/(app)/_components/mobile-top-bar";
import { BottomNav } from "@/app/(app)/_components/bottom-nav";

/**
 * Shared authenticated app shell — mounted once for every route under this
 * group, so the sidebar/top bar persist across navigation between sections
 * instead of unmounting and remounting (each section used to have its own
 * copy of this shell in its own layout.tsx). Server Component — checks the
 * session once for the whole group and redirects if not authenticated.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-dvh bg-muted/30 overflow-hidden">
      <MobileTopBar />
      <Sidebar />
      {children}
      <BottomNav />
    </div>
  );
}
