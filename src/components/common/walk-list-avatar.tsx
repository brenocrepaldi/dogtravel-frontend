"use client";

import { useState } from "react";
import Image from "next/image";
import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";

export type Face = { name: string; photoUrl?: string | null; kind: "dog" | "person" };

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

// The fallback always sits under the photo, so a photo that is slow or fails to load shows
// the paw or initials instead of an empty box.
function FacePhoto({ face, sizes, small }: { face: Face; sizes: string; small?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <>
      <FaceFallback face={face} small={small} />
      {face.photoUrl && !failed && (
        <Image
          src={face.photoUrl}
          alt={face.name}
          fill
          sizes={sizes}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </>
  );
}

const asList = (faces: Face | Face[] | undefined) =>
  faces === undefined ? [] : Array.isArray(faces) ? faces : [faces];

/**
 * A walk in a list: the face that matters most to the viewer, with the other
 * party tucked into the corner (the walker sees the dog with its tutor; the
 * client sees the walker with their dog).
 *
 * A walk can take several dogs, so either side accepts a list: as the main face, two dogs
 * split the tile in halves; in the corner, two dogs overlap as small circles, and a third
 * dog or more turns the second circle into a "+n" count.
 */
export function WalkListAvatar({ main, corner }: { main: Face | Face[]; corner?: Face | Face[] }) {
  const mains = asList(main);
  const corners = asList(corner);
  const extraCorners = corners.length - 1;

  return (
    <div className="relative h-10 w-10 shrink-0 transition-transform duration-150 group-hover:scale-105">
      <div className="relative flex h-full w-full gap-px overflow-hidden rounded-xl bg-card ring-1 ring-border/30">
        {mains.slice(0, 2).map((face, i) => (
          <div key={`${face.name}-${i}`} className="relative h-full flex-1 overflow-hidden">
            <FacePhoto face={face} sizes={mains.length > 1 ? "20px" : "40px"} small={mains.length > 1} />
          </div>
        ))}
      </div>

      {corners.length > 0 && (
        <div className="absolute -bottom-1 -right-1 flex flex-row-reverse" title={corners.map((c) => c.name).join(", ")}>
          <div className="relative z-10 h-5 w-5 overflow-hidden rounded-full ring-2 ring-card">
            <FacePhoto face={corners[0]!} sizes="20px" small />
          </div>
          {extraCorners === 1 && (
            <div className="relative -mr-1.5 h-5 w-5 overflow-hidden rounded-full ring-2 ring-card">
              <FacePhoto face={corners[1]!} sizes="20px" small />
            </div>
          )}
          {extraCorners > 1 && (
            <div className="relative -mr-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[8px] font-bold text-muted-foreground ring-2 ring-card">
              +{extraCorners}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
