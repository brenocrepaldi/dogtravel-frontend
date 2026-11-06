'use client';

import { Loader2 } from 'lucide-react';

// Shared by the map's two loading phases (bundle download, then first
// location fetch) so the screen doesn't jump between two different styles.
export function TrackingLoader({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-4">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute h-full w-full animate-ping rounded-full bg-primary/20" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
