import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Consistent page header used across all authenticated pages.
 * Renders a title, optional description, and optional action slot (button, etc.)
 */
export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8", className)}>
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-start">{action}</div>}
    </div>
  );
}
