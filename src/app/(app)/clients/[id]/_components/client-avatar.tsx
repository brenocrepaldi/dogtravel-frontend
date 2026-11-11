import Image from "next/image";
import { cn } from "@/lib/utils";
import { clientGradient, clientInitials } from "./client-detail-helpers";

export function ClientAvatar({
  name,
  avatarUrl,
  size = "lg",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "lg";
}) {
  const sizeCls = size === "lg"
    ? "w-20 h-20 text-2xl rounded-2xl ring-2 ring-border/30"
    : "w-10 h-10 text-sm rounded-xl ring-2 ring-border/30";

  if (avatarUrl) {
    return (
      <div className={cn("relative shrink-0 overflow-hidden", sizeCls)}>
        <Image src={avatarUrl} alt={name} fill sizes="80px" className="object-cover" />
      </div>
    );
  }
  return (
    <div className={cn(
      "shrink-0 bg-gradient-to-br flex items-center justify-center font-bold text-foreground/70",
      clientGradient(name),
      sizeCls,
    )}>
      {clientInitials(name)}
    </div>
  );
}
