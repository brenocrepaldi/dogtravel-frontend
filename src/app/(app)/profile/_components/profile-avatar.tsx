"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/features/profile/hooks/use-profile";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface Props {
  fallbackName: string;
  fallbackImage?: string;
}

export function ProfileAvatar({ fallbackName, fallbackImage }: Props) {
  const { data: profile } = useProfile();

  const avatarUrl = profile?.avatarUrl ?? fallbackImage ?? "";
  const name      = profile?.name ?? fallbackName;
  const initials  = name ? getInitials(name) : "?";

  return (
    <Avatar className="h-14 w-14 ring-2 ring-border/40 ring-offset-2 ring-offset-card shadow-sm shrink-0">
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
