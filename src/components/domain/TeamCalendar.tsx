import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useTeamSchedule } from "@/lib/hooks";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { TeamScheduleEvent } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface TeamCalendarProps {
  teamId: string;
  teamName: string;
}

export default function TeamCalendar({ teamId, teamName }: TeamCalendarProps) {
const { t } = useTranslation();
  const { data: response } = useTeamSchedule(teamId);
  const schedule = response?.schedule ?? [];
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOffset = (getDay(startOfMonth(currentMonth)) + 6) % 7;

  const matchesByDate = useMemo(() => {
    const map = new Map<string, TeamScheduleEvent[]>();
    for (const event of schedule) {
      const dateKey = event.date.slice(0, 10);
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(event);
    }
    return map;
  }, [schedule]);

  return (
    <GlassCard variant="soft" className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={16} className="text-[var(--color-cyan-400)]" />
        <h4 className="text-sm font-bold text-[var(--color-slate-100)]">Calendario de {teamName}</h4>
      </div>

      {/* Month navigator */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setCurrentMonth((m) => subMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <ChevronLeft size={14} className="text-[var(--color-slate-400)]" />
        </button>
        <span className="text-xs font-bold text-[var(--color-slate-200)] capitalize">{format(currentMonth, "MMMM yyyy", { locale: es })}</span>
        <button onClick={() => setCurrentMonth((m) => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <ChevronRight size={14} className="text-[var(--color-slate-400)]" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
          <div key={d} className="text-center text-[9px] font-bold text-[var(--color-slate-600)] py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayMatches = matchesByDate.get(dateKey) || [];
          const hasMatch = dayMatches.length > 0;
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={dateKey}
              className={cn(
                "relative rounded-lg p-1 text-center text-[10px] min-h-[36px] flex flex-col items-center justify-center transition-colors",
                isToday && "bg-[var(--color-lime-400)]/10 border border-[var(--color-lime-400)]/20",
                hasMatch && !isToday && "bg-[var(--color-magenta-500)]/10",
                !hasMatch && !isToday && "hover:bg-white/[0.03]"
              )}
            >
              <span className={cn("font-semibold", isToday ? "text-[var(--color-lime-400)]" : "text-[var(--color-slate-300)]")}>{format(day, "d")}</span>
              {hasMatch && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayMatches.slice(0, 3).map((m, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1 h-1 rounded-full",
                        m.completed ? "bg-[var(--color-slate-500)]" : "bg-[var(--color-cyan-400)]"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[9px] text-[var(--color-slate-500)]">
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan-400)]" /> Próximo</div>
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[var(--color-slate-500)]" /> Finalizado</div>
      </div>

      {/* Upcoming matches */}
      <div className="mt-4 space-y-2">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-slate-500)]">{t("Próximos partidos")}</h5>
        {schedule.filter((e) => !e.completed).slice(0, 5).map((event, i) => {
          const isHome = event.homeTeamId === teamId;
          const opponent = isHome ? event.awayTeam : event.homeTeam;
          return (
            <div key={i} className="flex items-center gap-2 py-1.5 text-xs border-b border-white/[0.03] last:border-0">
              <span className="w-16 text-[var(--color-slate-500)] text-[10px]">
                {format(new Date(event.date), "EEE d MMM", { locale: es })}
              </span>
              <span className="flex-1 text-[var(--color-slate-300)] truncate">
                {isHome ? "vs" : "@"} {opponent}
              </span>
              <Badge tone={isHome ? "cyan" : "default"} className="text-[8px]">{isHome ? "L" : "V"}</Badge>
              {event.score && (
                <span className="text-[10px] font-bold text-[var(--color-lime-400)]">{event.score}</span>
              )}
            </div>
          );
        })}
        {schedule.filter((e) => !e.completed).length === 0 && (
          <p className="text-[11px] text-[var(--color-slate-500)]">{t("No hay partidos programados")}</p>
        )}
      </div>
    </GlassCard>
  );
}
