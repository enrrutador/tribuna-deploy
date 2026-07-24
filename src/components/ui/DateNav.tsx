import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";
import { format, addDays, subDays, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface DateNavProps {
  date: Date;
  onChange: (d: Date) => void;
  className?: string;
}

export function DateNav({ date, onChange, className }: DateNavProps) {
const { t } = useTranslation();
  const today = isToday(date);
  const label = today
    ? t("Hoy")
    : format(date, "EEE d 'de' MMM", { locale: es });

  return (
    <div className={cn("glass flex items-center gap-1 rounded-xl p-1", className)}>
      <button
        onClick={() => onChange(subDays(date, 1))}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-slate-400)] transition-colors hover:bg-white/5 hover:text-[var(--color-slate-100)]"
        aria-label={t("Día anterior")}
      >
        <ChevronLeft size={16} />
      </button>
      <div className="flex items-center gap-1.5 px-3 text-sm font-semibold text-[var(--color-slate-100)]">
        <CalIcon size={14} className="text-[var(--color-lime-400)]" />
        <span className="min-w-[110px] text-center capitalize">{label}</span>
      </div>
      <button
        onClick={() => onChange(addDays(date, 1))}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-slate-400)] transition-colors hover:bg-white/5 hover:text-[var(--color-slate-100)]"
        aria-label={t("Día siguiente")}
      >
        <ChevronRight size={16} />
      </button>
      {!today && (
        <button
          onClick={() => onChange(new Date())}
          className="ml-1 rounded-lg bg-[var(--color-lime-500)]/12 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--color-lime-400)] transition-colors hover:bg-[var(--color-lime-500)]/20"
        >
          {t("Hoy")}
        </button>
      )}
    </div>
  );
}
