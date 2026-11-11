import Image from "next/image";
import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";

type Face = { name: string; photoUrl?: string | null; kind: "dog" | "person" };

function FaceFallback({ face, small }: { face: Face; small?: boolean }) {
  if (face.kind === "dog") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-amber-100">
        <PawPrint className={cn("text-amber-600", small ? "h-2.5 w-2.5" : "h-5 w-5")} />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-primary/10 font-bold text-primary",
        small ? "text-[8px]" : "text-xs",
      )}
    >
      {getInitials(face.name)}
    </div>
  );
}

/**
 * A walk in a list: the face that matters most to the viewer, with the other
 * party tucked into the corner (the walker sees the dog with its tutor; the
 * client sees the walker with their dog).
 */
export function WalkListAvatar({ main, corner }: { main: Face; corner?: Face }) {
  return (
    <div className="relative h-10 w-10 shrink-0 transition-transform duration-150 group-hover:scale-105">
      <div className="relative h-full w-full overflow-hidden rounded-xl ring-1 ring-border/30">
        {main.photoUrl ? (
          <Image src={main.photoUrl} alt={main.name} fill sizes="40px" className="object-cover" />
        ) : (
          <FaceFallback face={main} />
        )}
      </div>
      {corner && (
        <div
          className="absolute -bottom-1 -right-1 h-5 w-5 overflow-hidden rounded-full ring-2 ring-card"
          title={corner.name}
        >
          {corner.photoUrl ? (
            <Image src={corner.photoUrl} alt={corner.name} fill sizes="20px" className="object-cover" />
          ) : (
            <FaceFallback face={corner} small />
          )}
        </div>
      )}
    </div>
  );
}
