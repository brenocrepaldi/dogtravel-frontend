import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solicitar Passeio | DogTravel",
};

/**
 * Walk request content wrapper — full-width area suited for the multi-step
 * form + summary panel split.
 */
export default function WalksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col pt-14 pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pt-0 lg:pb-0">
      <div className="max-w-screen-xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-h-full">
        {children}
      </div>
    </div>
  );
}
