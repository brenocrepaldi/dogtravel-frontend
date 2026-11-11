"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Px a finger must travel before a press becomes a drag (taps on buttons still click). */
const DRAG_THRESHOLD = 6;
/** Px of travel that flips the sheet on a slow drag. */
const SNAP_DISTANCE = 40;
/** Px/ms above which a flick decides by direction alone. */
const FLICK_VELOCITY = 0.5;

/**
 * Where the sheet settles once the finger lifts. `dy`/`velocity` are negative
 * when moving up. A flick wins by direction; otherwise only a drag longer
 * than SNAP_DISTANCE changes the state.
 */
export function resolveSheetSnap({
  expanded,
  dy,
  velocity,
}: {
  expanded: boolean;
  dy: number;
  velocity: number;
}): boolean {
  if (Math.abs(velocity) > FLICK_VELOCITY) return velocity < 0;
  if (dy < -SNAP_DISTANCE) return true;
  if (dy > SNAP_DISTANCE) return false;
  return expanded;
}

interface MapBottomSheetProps {
  /** Always visible: the summary and the main action. */
  peek: React.ReactNode;
  /** Revealed by dragging the sheet up or tapping the grabber. */
  children: React.ReactNode;
  className?: string;
}

/**
 * Bottom sheet over a full-screen map, as in ride/delivery apps: a short peek
 * keeps the map visible, and dragging up (or tapping the grabber) reveals the
 * details. Anchored at the bottom, it grows upwards by animating the height
 * of the details, so nothing hangs below its edge.
 */
export function MapBottomSheet({ peek, children, className }: MapBottomSheetProps) {
  const [expanded, setExpanded] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [detailsHeight, setDetailsHeight] = useState(0);
  const detailsRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    startY: number;
    baseHeight: number;
    lastY: number;
    lastT: number;
    velocity: number;
    active: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setDetailsHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = {
      startY: e.clientY,
      baseHeight: expanded ? detailsHeight : 0,
      lastY: e.clientY,
      lastT: e.timeStamp,
      velocity: 0,
      active: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.startY;
    if (!d.active) {
      if (Math.abs(dy) < DRAG_THRESHOLD) return;
      d.active = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.velocity = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    setDragHeight(Math.min(detailsHeight, Math.max(0, d.baseHeight - dy)));
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d?.active) return;
    suppressClick.current = true;
    setExpanded(resolveSheetSnap({ expanded, dy: e.clientY - d.startY, velocity: d.velocity }));
    setDragHeight(null);
  };

  const height = dragHeight ?? (expanded ? detailsHeight : 0);

  return (
    <div
      className={cn(
        "touch-none select-none overflow-hidden rounded-3xl border border-white/20 bg-background/95 shadow-2xl shadow-black/15 backdrop-blur-md",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      // A drag that started on a button must not also press it.
      onClickCapture={(e) => {
        if (!suppressClick.current) return;
        suppressClick.current = false;
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? "Ocultar detalhes" : "Mostrar detalhes"}
        onClick={() => setExpanded((v) => !v)}
        className="flex h-6 w-full cursor-grab items-center justify-center"
      >
        <span className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
      </button>

      {peek}

      <div
        style={{ height }}
        className={cn(
          "overflow-hidden",
          dragHeight === null && "transition-[height] duration-300 ease-out motion-reduce:transition-none",
        )}
        inert={!expanded && dragHeight === null}
      >
        <div ref={detailsRef}>{children}</div>
      </div>
    </div>
  );
}
