import { cn } from "@/lib/utils";
import type { RoundInfo } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface RoundSelectorProps {
  rounds: RoundInfo[];
  selectedKey: string | null;
  onChange: (key: string) => void;
}

export default function RoundSelector({ rounds, selectedKey, onChange }: RoundSelectorProps) {
const { t } = useTranslation();
  if (rounds.length === 0) return null;

  return (
    <div className="relative">
      <select
        value={selectedKey ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="glass w-full appearance-none rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-[var(--color-slate-100)] outline-none transition-colors hover:border-[var(--color-lime-400)]/30 focus:border-[var(--color-lime-400)]/50"
      >
        {rounds.map((r) => (
          <option key={r.key} value={r.key} className="bg-[#1a1d23] text-[var(--color-slate-100)]">
            {r.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[var(--color-slate-400)]">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
