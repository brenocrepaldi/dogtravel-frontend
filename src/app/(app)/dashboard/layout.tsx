import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | DogTravel",
    default: "Dashboard | DogTravel",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto pt-14 pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pt-0 lg:pb-0">
        <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
