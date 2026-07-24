import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "live";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-lime-500)] text-[var(--color-void)] font-bold hover:bg-[var(--color-lime-400)] shadow-[0_0_18px_var(--color-lime-glow)] hover:shadow-[0_0_26px_var(--color-lime-glow)]",
  secondary:
    "glass text-[var(--color-slate-100)] hover:bg-white/10 hover:border-white/15",
  ghost:
    "text-[var(--color-slate-300)] hover:bg-white/5 hover:text-[var(--color-slate-50)]",
  outline:
    "border border-[var(--color-slate-600)] text-[var(--color-slate-200)] hover:border-[var(--color-lime-500)] hover:text-[var(--color-lime-400)]",
  danger:
    "bg-[var(--color-danger)] text-white font-bold hover:bg-red-500 shadow-[0_0_18px_rgba(255,77,79,0.4)]",
  live:
    "bg-[var(--color-live)] text-white font-bold hover:bg-red-500 shadow-[var(--shadow-glow-live)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
  icon: "h-10 w-10 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-lime-500)]/50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
