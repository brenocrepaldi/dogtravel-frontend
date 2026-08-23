import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil | DogTravel",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 overflow-y-auto pt-14 lg:pt-0">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
