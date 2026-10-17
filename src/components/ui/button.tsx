import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold tracking-[-0.01em] transition-[opacity,transform,background-color,border-color,box-shadow,color] duration-150 ease-[var(--ease-out-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.985]",
  {
    variants: {
      variant: {
        default:
          "border border-primary/35 bg-primary text-primary-foreground shadow-[0_8px_28px_rgba(var(--glow-rgb),0.14)] hover:brightness-105",
        secondary:
          "border border-border/70 bg-card-2/80 text-foreground shadow-[var(--shadow-inner)] hover:border-border-strong hover:bg-card-2",
        ghost: "border border-transparent text-muted hover:bg-card-2 hover:text-foreground",
        outline:
          "border border-border/80 bg-transparent text-foreground hover:border-primary/25 hover:bg-primary/[0.05]",
        danger: "border border-destructive/30 bg-destructive text-background hover:brightness-105",
      },
      size: {
        default: "h-10 px-3.5",
        sm: "h-8 px-2.5 text-[11px]",
        lg: "h-11 px-4 text-sm",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
