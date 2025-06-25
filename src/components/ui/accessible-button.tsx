
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const accessibleButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline focus:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      mobileOptimized: {
        true: "min-h-[44px] min-w-[44px] touch-manipulation",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      mobileOptimized: true,
    },
  }
)

export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof accessibleButtonVariants> {
  asChild?: boolean
  loadingText?: string
  isLoading?: boolean
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    mobileOptimized,
    asChild = false, 
    children,
    loadingText = "Loading...",
    isLoading = false,
    disabled,
    'aria-label': ariaLabel,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const effectiveAriaLabel = React.useMemo(() => {
      if (isLoading && loadingText) return loadingText;
      if (ariaLabel) return ariaLabel;
      if (typeof children === 'string') return children;
      return undefined;
    }, [isLoading, loadingText, ariaLabel, children]);

    return (
      <Comp
        className={cn(accessibleButtonVariants({ variant, size, mobileOptimized, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-label={effectiveAriaLabel}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? loadingText : children}
      </Comp>
    )
  }
)
AccessibleButton.displayName = "AccessibleButton"

export { AccessibleButton, accessibleButtonVariants }
