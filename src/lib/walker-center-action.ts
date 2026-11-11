export type WalkerCenterAction = {
  kind: "live" | "today" | "requests";
  href: string;
  label: string;
};

type WalkLike = { id: string; status: string; scheduledAt: string };

function isSameLocalDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Where the walker's center nav button leads right now: the live map while a
 * walk is in progress, else today's next accepted walk, else the requests
 * inbox. Pure so the rule can be tested and explained on its own.
 */
export function walkerCenterAction(walks: readonly WalkLike[], now: Date): WalkerCenterAction {
  const live = walks.find((w) => w.status === "in_progress");
  if (live) return { kind: "live", href: `/walks/${live.id}/tracking`, label: "Ao vivo" };

  const today = walks
    .filter((w) => w.status === "accepted" && isSameLocalDay(new Date(w.scheduledAt), now))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
  if (today) return { kind: "today", href: `/walks/${today.id}`, label: "Hoje" };

  return { kind: "requests", href: "/walk-requests", label: "Pedidos" };
}
