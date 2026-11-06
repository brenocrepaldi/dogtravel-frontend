import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/common/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DogTravel — Passeios para o seu cão",
    template: "%s | DogTravel",
  },
  description:
    "Conectamos donos de cães com passeadores confiáveis perto de você. Agende passeios, acompanhe em tempo real e cuide do seu melhor amigo.",
  keywords: ["passeio de cão", "dog walker", "passeador de cães", "pet care"],
  authors: [{ name: "DogTravel" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "DogTravel",
  },
  appleWebApp: {
    capable: true,
    title: "DogTravel",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#3B82F6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
