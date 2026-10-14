import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/common/sidebar";
import { MobileTopBar } from "@/components/common/mobile-top-bar";
import { BottomNav } from "@/components/common/bottom-nav";

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
