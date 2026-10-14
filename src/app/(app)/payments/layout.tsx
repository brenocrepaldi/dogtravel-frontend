import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagamentos e Ganhos | DogTravel",
};

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 overflow-y-auto pt-14 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pt-0 lg:pb-0">
      <div className="max-w-screen-lg mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
