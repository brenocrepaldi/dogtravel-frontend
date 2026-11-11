import { cn } from "@/lib/utils";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex flex-col gap-1.5 rounded-xl border border-border/50 bg-card px-4 py-3.5",
      className,
    )}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
      </div>
      <p className="text-sm font-semibold text-foreground leading-snug">{value}</p>
    </div>
  );
}

export function SectionHeader({
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  title,
  description,
}: {
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  title: string;
  description: string;
}) {
  return (
    <CardHeader className="pt-5">
      <div className="flex items-center gap-2.5">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={cn("w-4 h-4", iconColor)} />
        </div>
        <div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}
