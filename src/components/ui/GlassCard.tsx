import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "soft" | "strong";
  glow?: "none" | "lime" | "cyan" | "magenta";
  hover?: boolean;
}

const variantClasses: Record<NonNullable<GlassCardProps["variant"]>, string> = {
  default: "glass",
  soft: "glass-soft",
  strong: "glass-strong",
};

const glowClasses: Record<NonNullable<GlassCardProps["glow"]>, string> = {
  none: "",
  lime: "shadow-[0_0_28px_var(--color-lime-glow)]",
  cyan: "shadow-[0_0_28px_var(--color-cyan-glow)]",
  magenta: "shadow-[0_0_28px_var(--color-magenta-glow)]",
};

/** Frosted glass surface — the core visual building block. */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", glow = "none", hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300",
          variantClasses[variant],
          glowClasses[glow],
          hover &&
            "hover:border-white/12 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";
