import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Invisible ≥44px hit area centered on the button, without changing its visual size
// (WCAG/Apple HIG touch target guidance) — applied to the size variants below.
export const TOUCH_TARGET =
  "after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 ease-in-out outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer data-[loading=true]:opacity-80 data-[loading=true]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-sm hover:shadow-md active:shadow-sm active:translate-y-px",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground hover:border-muted-foreground/20 active:bg-muted/80 aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 dark:hover:border-input/60",
        secondary:
          "bg-secondary border-secondary text-secondary-foreground hover:bg-secondary/50 hover:border-secondary/50 active:bg-secondary/90 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground shadow-sm hover:shadow active:shadow-sm",
        ghost:
          "hover:bg-muted hover:text-foreground active:bg-muted/80 aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 active:bg-destructive/25 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
        success: "bg-success text-success-foreground hover:bg-success/90 active:bg-success/95 shadow-sm hover:shadow-md active:shadow-sm",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 active:bg-warning/95 shadow-sm hover:shadow-md active:shadow-sm",
      },
      size: {
        default:
          cn("h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2", TOUCH_TARGET),
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: cn("h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-3 py-3 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4", TOUCH_TARGET),
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xl: "h-11 gap-2 px-4 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: cn("size-8", TOUCH_TARGET),
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          cn("size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg", TOUCH_TARGET),
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  // If `render` is provided (e.g., rendering a <Link>), automatic opt-out of nativeButton
  // to avoid Base UI runtime errors complaining about non-native <button> elements.
  const isNative = nativeButton !== undefined ? nativeButton : (props.render ? false : true);

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      nativeButton={isNative}
      {...props}
    />
  )
}

export { Button, buttonVariants }
