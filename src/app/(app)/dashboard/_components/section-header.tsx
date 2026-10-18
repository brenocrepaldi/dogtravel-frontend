import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <Link
        href={href}
        className="-my-3.5 flex items-center gap-0.5 py-3.5 pl-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {linkLabel}
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
