import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { useTranslation } from "@/lib/i18n";

interface SegmentedProps<T extends string> {
  options: { value: T; label: string; badge?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div className={cn("glass inline-flex gap-1 rounded-xl p-1", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "relative inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors md:text-sm",
            value === opt.value
              ? "text-[var(--color-void)]"
              : "text-[var(--color-slate-400)] hover:text-[var(--color-slate-200)]"
          )}
        >
          {value === opt.value && (
            <motion.div
              layoutId={`seg-${options.map((o) => o.value).join()}`}
              className="absolute inset-0 rounded-lg bg-[var(--color-lime-500)]"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {opt.label}
            {opt.badge}
          </span>
        </button>
      ))}
    </div>
  );
}
