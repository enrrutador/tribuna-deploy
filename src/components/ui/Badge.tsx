import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

type Tone =
  | "default"
  | "lime"
  | "cyan"
  | "magenta"
  | "live"
  | "warn"
  | "danger"
  | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  pulse?: boolean;
}

const tones: Record<Tone, string> = {
  default: "bg-white/8 text-[var(--color-slate-300)] border-white/10",
  lime: "bg-[var(--color-lime-500)]/12 text-[var(--color-lime-400)] border-[var(--color-lime-500)]/25",
  cyan: "bg-[var(--color-cyan-500)]/12 text-[var(--color-cyan-400)] border-[var(--color-cyan-500)]/25",
  magenta: "bg-[var(--color-magenta-500)]/12 text-[var(--color-magenta-400)] border-[var(--color-magenta-500)]/25",
  live: "bg-[var(--color-live)]/15 text-[var(--color-live)] border-[var(--color-live)]/30",
  warn: "bg-[var(--color-warn)]/12 text-[var(--color-warn)] border-[var(--color-warn)]/25",
  danger: "bg-[var(--color-danger)]/12 text-[var(--color-danger)] border-[var(--color-danger)]/25",
  info: "bg-[var(--color-cyan-500)]/12 text-[var(--color-cyan-400)] border-[var(--color-cyan-500)]/25",
};

export function Badge({ className, tone = "default", pulse, children, ...props }: BadgeProps) {
const { t } = useTranslation();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        tones[tone],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
