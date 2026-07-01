import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface SectionTitleProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  accent?: "lime" | "cyan" | "magenta";
}

const accents = {
  lime: "text-[var(--color-lime-400)]",
  cyan: "text-[var(--color-cyan-400)]",
  magenta: "text-[var(--color-magenta-400)]",
};

export function SectionTitle({
  icon,
  title,
  subtitle,
  action,
  className,
  accent = "lime",
}: SectionTitleProps) {
const { t } = useTranslation();
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        {icon && (
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-white/5", accents[accent])}>
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-slate-50)] md:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-[var(--color-slate-400)]">{subtitle}</p>
          )}
        </div>
      </motion.div>
      {action}
    </div>
  );
}
