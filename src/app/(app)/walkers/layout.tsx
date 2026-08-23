import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passeadores | DogTravel",
};

export default function WalkersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col pt-14 lg:pt-0">
      <div className="max-w-screen-xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex flex-col min-h-full">
        {children}
      </div>
    </div>
  );
}
