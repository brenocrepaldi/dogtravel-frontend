"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  PawPrint,
  LayoutDashboard,
  ClipboardList,
  Dog,
  User,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck2,
  Info,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DocStatus } from "@/types";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import { useProfile } from "@/features/profile/hooks/use-profile";

// ─── Nav items per role ───────────────────────────────────────────────────────

export const clientNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard"     },
  { href: "/walks",     icon: ClipboardList,   label: "Meus passeios" },
  { href: "/walkers",   icon: PawPrint,         label: "Passeadores"  },
  { href: "/dogs",      icon: Dog,              label: "Meus Cães"    },
  { href: "/profile",   icon: User,             label: "Perfil"       },
];

export const walkerNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard"     },
  { href: "/walks",     icon: ClipboardList,   label: "Meus passeios" },
  { href: "/profile",   icon: User,            label: "Perfil"        },
];

// ─── Nav links (shared between desktop sidebar and mobile drawer) ─────────────

export function SidebarNavLinks({
  navItems,
  pathname,
}: {
  navItems: typeof clientNav;
  pathname: string;
}) {
  return (
    <div className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px]",
              isActive
                ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 shrink-0 transition-transform duration-200",
              isActive && "scale-110"
            )} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Step row ─────────────────────────────────────────────────────────────────

interface Step {
  icon: React.ElementType;
  label: string;
  status: DocStatus;
  href: string;
}

function StepRow({ icon: Icon, label, status }: Omit<Step, "href">) {
  const isDone     = status === "verified";
  const isPending  = status === "pending";
  const isRejected = status === "rejected";

  const bgCls =
    isDone     ? "bg-emerald-500/10" :
    isPending  ? "bg-amber-500/10"   :
    isRejected ? "bg-red-500/10"     : "bg-muted";

  const statusLabel =
    isDone     ? "Verificado"  :
    isPending  ? "Em análise"  :
    isRejected ? "Recusado"    : "Não enviado";

  const statusCls =
    isDone     ? "text-emerald-600 dark:text-emerald-400" :
    isPending  ? "text-amber-600 dark:text-amber-400"     :
    isRejected ? "text-red-600 dark:text-red-400"         : "text-muted-foreground/60";

  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md", bgCls)}>
        {isDone ? (
          <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        ) : isPending ? (
          <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
        ) : isRejected ? (
          <XCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
        ) : (
          <Icon className="h-3 w-3 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-[11px] font-medium leading-none", isDone ? "text-muted-foreground" : "text-foreground")}>
          {label}
        </p>
        <p className={cn("mt-0.5 text-[10px] leading-none", statusCls)}>
          {statusLabel}
        </p>
      </div>
    </div>
  );
}

// ─── Walker onboarding widget ─────────────────────────────────────────────────

export function WalkerOnboarding() {
  const { data: docStatus } = useDocuments();
  const { data: profile } = useProfile();

  const hasPhoto = !!profile?.avatarUrl;

  const requiredSteps: Step[] = [
    {
      icon: User,
      label: "Foto de perfil",
      status: hasPhoto ? "verified" : "idle",
      href: "/profile/details",
    },
    {
      icon: ShieldCheck,
      label: "Verificação de identidade",
      status: docStatus?.identity ?? "idle",
      href: "/profile/documents",
    },
    {
      icon: FileCheck2,
      label: "Antecedentes criminais",
      status: docStatus?.background ?? "idle",
      href: "/profile/documents",
    },
  ];

  const certs = docStatus?.certificates ?? [];
  const certStatus: DocStatus =
    certs.some((c) => c.status === "verified") ? "verified"
    : certs.length > 0 ? "pending"
    : "idle";

  const requiredCompleted = requiredSteps.filter((s) => s.status === "verified").length;
  const canAcceptWalks    = requiredCompleted === requiredSteps.length;
  const pct               = Math.round((requiredCompleted / requiredSteps.length) * 100);

  if (canAcceptWalks) return null;

  const hasRejected = requiredSteps.some((s) => s.status === "rejected");
  const hasPending  = requiredSteps.some((s) => s.status === "pending");

  const headerLabel    = hasRejected ? "Ação necessária"   : "Conclua os requisitos";
  const accentColor    = hasRejected ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400";
  const accentGradient = hasRejected
    ? "from-red-400/60 via-red-500 to-red-400/40"
    : "from-amber-400/60 via-amber-500 to-amber-400/40";
  const borderCls      = hasRejected ? "border-red-500/20" : "border-amber-500/20";
  const barCls         = hasRejected
    ? "bg-gradient-to-r from-red-500 to-red-400"
    : "bg-gradient-to-r from-amber-500 to-amber-400";

  const ctaHref =
    requiredSteps.find((s) => s.status === "rejected")?.href ??
    requiredSteps.find((s) => s.status === "idle")?.href ??
    "/profile/documents";
  const ctaLabel = hasRejected ? "Revisar documentos" : hasPending ? "Ver progresso" : "Completar perfil";

  return (
    <div className="px-3 pb-3">
      <div className={cn("overflow-hidden rounded-xl border", borderCls)}>
        {/* Accent bar */}
        <div className={cn("h-0.5 w-full bg-gradient-to-r", accentGradient)} />

        <div className="space-y-3 p-3">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <p className={cn("text-[11px] font-semibold leading-none", accentColor)}>
              {headerLabel}
            </p>
            <span className={cn("shrink-0 text-[10px] font-bold tabular-nums", accentColor)}>
              {requiredCompleted}/{requiredSteps.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all duration-700", barCls)}
              style={{ width: `${pct > 0 ? Math.max(pct, 3) : 0}%` }}
            />
          </div>

          {/* Required steps */}
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Obrigatórios
          </p>

          <div className="space-y-2.5">
            {requiredSteps.map((step) => (
              <StepRow key={step.label} icon={step.icon} label={step.label} status={step.status} />
            ))}
          </div>

          {/* Optional — certifications */}
          <div className="space-y-2 border-t border-border/40 pt-2.5">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Opcional
              </p>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground hover:text-zinc-900 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[200px]">
                    Perfis com certificações verificadas ganham mais visibilidade e conquistam a confiança dos tutores com mais facilidade.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Cert row — visually subdued */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                  certStatus === "verified" ? "bg-emerald-500/10" :
                  certStatus === "pending"  ? "bg-amber-500/10"   : "bg-muted",
                )}
              >
                {certStatus === "verified" ? (
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                ) : certStatus === "pending" ? (
                  <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Award className="h-3 w-3 text-muted-foreground/50" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium leading-none text-muted-foreground">
                  Certificações
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-[10px] leading-none",
                    certStatus === "verified" ? "text-emerald-600 dark:text-emerald-400" :
                    certStatus === "pending"  ? "text-amber-600 dark:text-amber-400"     : "text-muted-foreground/50",
                  )}
                >
                  {certStatus === "verified" ? "Adicionado" :
                   certStatus === "pending"  ? "Em análise" : "Adicionar para se destacar"}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={ctaHref}
            className={cn(
              "flex items-center gap-0.5 text-[11px] font-semibold transition-opacity hover:opacity-75",
              accentColor,
            )}
          >
            {ctaLabel}
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: profile } = useProfile();

  const role = session?.user?.role ?? "client";
  const navItems = role === "walker" ? walkerNav : clientNav;

  const userName = session?.user?.name ?? "Usuário";
  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const avatarUrl = profile?.avatarUrl ?? null;

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border bg-background h-dvh sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <PawPrint className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-base text-foreground tracking-tight">
          DogTravel
        </span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <SidebarNavLinks navItems={navItems} pathname={pathname} />
      </nav>

      {/* Walker onboarding widget */}
      {role === "walker" && <WalkerOnboarding />}

      <Separator />

      {/* User */}
      <div className="px-3 py-4">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 min-h-[44px]",
            pathname === "/profile" || pathname.startsWith("/profile/")
              ? "bg-accent/80 ring-1 ring-accent"
              : "hover:bg-accent/50 active:bg-accent"
          )}
        >
          <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />}
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {role === "walker" ? "Passeador" : "Cliente"}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
