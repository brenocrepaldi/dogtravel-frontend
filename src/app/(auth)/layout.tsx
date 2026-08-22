import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPin, PawPrint, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Autenticação",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh grid lg:grid-cols-2">

      {/* ─── Left panel ──────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-10 relative overflow-hidden">

        {/* Geometric shapes */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-1/2 -left-24 h-56 w-56 rounded-full bg-white/[0.04]" />
        <div className="pointer-events-none absolute -bottom-20 right-4 h-80 w-80 rounded-full bg-white/[0.03]" />
        <PawPrint className="pointer-events-none absolute right-6 top-[22%] h-48 w-48 text-white/[0.06] rotate-12" />
        <PawPrint className="pointer-events-none absolute bottom-14 left-5 h-16 w-16 text-white/[0.06] -rotate-6" />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5 text-primary-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <PawPrint className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg tracking-tight">DogTravel</span>
        </Link>

        {/* Center — headline + product card */}
        <div className="relative z-10 space-y-7">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50">
              Passeios com segurança
            </p>
            <h2 className="text-3xl font-bold leading-snug text-primary-foreground">
              Conecte seu cão<br />ao passeador ideal
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/65">
              Agende passeios com profissionais verificados, acompanhe em tempo real
              e garanta a segurança do seu pet.
            </p>
          </div>

          {/* Mock walk card */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white">
                  CS
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Carlos Silva</p>
                  <p className="text-xs text-white/55">Rex · Golden Retriever</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-1">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[11px] font-medium text-emerald-300">Em andamento</span>
              </div>
            </div>

            <div className="my-4 h-px bg-white/10" />

            <div className="flex items-center justify-between text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 shrink-0" />
                Av. Paulista, 900
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 shrink-0" />
                30 min
              </span>
              <span className="font-semibold text-white/80">R$ 44,00</span>
            </div>

            <div className="mt-3 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1.5 text-[11px] text-white/50">4.9 · 143 avaliações</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: "10k+", label: "Passeios" },
            { value: "4.9★", label: "Avaliação" },
            { value: "98%",  label: "Satisfação" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-xl font-bold text-primary-foreground">{stat.value}</p>
              <p className="mt-0.5 text-xs text-primary-foreground/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Right panel — form ──────────────────────────────────────────────── */}
      <div className="flex min-h-dvh flex-col items-center justify-center p-8">
        <Link
          href="/"
          className="lg:hidden mb-8 flex items-center gap-2 text-xl font-bold text-primary"
        >
          <PawPrint className="h-6 w-6" />
          DogTravel
        </Link>

        <div className="w-full max-w-md">{children}</div>
      </div>

    </div>
  );
}
