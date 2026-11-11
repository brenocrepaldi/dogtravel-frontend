"use client";

import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  MapPin,
  PawPrint,
  Timer,
  XCircle,
} from "lucide-react";
import { formatBRL, formatElapsed, getInitials } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { WalkRequest } from "@/types";

interface WalkRequestCardProps {
  request: WalkRequest;
  onOpen: () => void;
  onAccept: () => void;
  onDecline: () => void;
  isAccepting?: boolean;
}

/** A pending walk request with its earnings and quick accept/decline actions. */
export function WalkRequestCard({
  request,
  onOpen,
  onAccept,
  onDecline,
  isAccepting,
}: WalkRequestCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className="relative cursor-pointer overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.05] via-card to-card shadow-sm"
    >
      {/* Left accent bar */}
      <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-emerald-400 to-emerald-600" />

      <div className="px-5 py-4 pl-6">
        {/* Top row: avatar + name/pets + price */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Client avatar */}
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-emerald-500/20">
              {request.clientAvatarUrl ? (
                <Image
                  src={request.clientAvatarUrl}
                  alt={request.clientName}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-emerald-500/10 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {getInitials(request.clientName)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="block truncate text-sm font-semibold text-foreground">
                {request.clientName}
              </p>
              {/* Dog photo bubbles + names */}
              <div className="mt-0.5 flex items-center gap-1.5">
                <div className="flex items-center">
                  {request.petPhotos.slice(0, 3).map((pet, i) => (
                    <div
                      key={pet.id}
                      style={{
                        zIndex: request.petPhotos.length - i,
                        marginLeft: i === 0 ? 0 : "-6px",
                      }}
                      className="relative h-5 w-5 overflow-hidden rounded-full ring-[1.5px] ring-card"
                    >
                      {pet.photoUrl ? (
                        <Image
                          src={pet.photoUrl}
                          alt=""
                          fill
                          sizes="20px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-amber-500/15">
                          <PawPrint className="h-2.5 w-2.5 text-amber-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {request.petNames.join(", ")}
                </p>
              </div>
            </div>
          </div>

          {/* Price — main motivator, visually dominant */}
          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold leading-none text-emerald-600 dark:text-emerald-400">
              {formatBRL(request.price)}
            </p>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground/70">
              ganho estimado
            </p>
          </div>
        </div>

        {/* Detail badges */}
        <div className="mt-3.5 flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1.5 text-xs text-foreground/70">
            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {request.scheduledLabel}
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1.5 text-xs text-foreground/70">
            <Timer className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {request.durationMinutes} min
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1.5 text-xs text-foreground/70">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {request.startAddress}
          </span>
        </div>

        {/* Divider */}
        <div className="mt-4 border-t border-border/40" />

        {/* Action row: timestamp + buttons */}
        <div className="mt-3.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {request.receivedMinutes < 2
              ? "Recebido agora"
              : `Recebido ${formatElapsed(request.receivedMinutes)}`}
          </span>

          <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center">
            <Button
              size="sm"
              variant="ghost"
              className="h-11 rounded-lg border border-border/60 px-3 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/8 lg:h-8 lg:border-0"
              onClick={(e) => {
                e.stopPropagation();
                onDecline();
              }}
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Recusar
            </Button>
            <Button
              size="sm"
              className="h-11 rounded-lg px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm shadow-emerald-500/25 lg:h-8"
              onClick={(e) => {
                e.stopPropagation();
                onAccept();
              }}
              disabled={isAccepting}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Aceitar passeio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
