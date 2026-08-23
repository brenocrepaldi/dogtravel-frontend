"use client";

import { Loader2, LogOut } from "lucide-react";
import { useLogout } from "@/features/auth/hooks/use-auth";

export function LogoutButton() {
  const { mutate: logout, isPending } = useLogout();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => logout()}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-destructive/5 cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
        {isPending
          ? <Loader2 className="w-4 h-4 text-destructive animate-spin" />
          : <LogOut className="w-4 h-4 text-destructive" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-destructive">
          {isPending ? "Saindo..." : "Sair da conta"}
        </p>
        <p className="text-xs text-muted-foreground">Encerrar sessão atual</p>
      </div>
    </button>
  );
}
