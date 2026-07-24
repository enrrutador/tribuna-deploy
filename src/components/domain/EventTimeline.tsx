import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import type { MatchEvent, Match } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

interface EventTimelineProps {
  events: MatchEvent[];
  match?: Match;
}

const EVENT_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  goal:        { icon: "⚽", color: "text-[var(--color-lime-400)]",  bg: "bg-[var(--color-lime-400)]" },
  owngoal:     { icon: "⚽", color: "text-[var(--color-danger)]",   bg: "bg-[var(--color-danger)]" },
  penalty:     { icon: "⚽", color: "text-[var(--color-lime-400)]",  bg: "bg-[var(--color-lime-400)]" },
  penalty_miss:{ icon: "✕",  color: "text-[var(--color-warn)]",     bg: "bg-[var(--color-warn)]" },
  yellow_card: { icon: "🟨", color: "text-[var(--color-warn)]",     bg: "bg-[var(--color-warn)]" },
  red_card:    { icon: "🟥", color: "text-[var(--color-danger)]",   bg: "bg-[var(--color-danger)]" },
  substitution:{ icon: "🔄", color: "text-[var(--color-cyan-400)]", bg: "bg-[var(--color-cyan-400)]" },
  var_review:  { icon: "📺", color: "text-[var(--color-magenta-400)]", bg: "bg-[var(--color-magenta-400)]" },
};

function EventRow({ event, homeId, isFirst, isLast }: { event: MatchEvent; homeId: string; isFirst: boolean; isLast: boolean }) {
  const { t } = useTranslation();
  const isHome = event.teamId === homeId;
  const style = EVENT_ICONS[event.type] ?? EVENT_ICONS.goal!;

  return (
    <motion.div
      initial={{ opacity: 0, x: isHome ? -16 : 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: isFirst ? 0 : 0.06, duration: 0.35 }}
      className="relative flex items-stretch gap-3 group"
    >
      {/* Home side (left) */}
      <div className={cn("flex-1 flex items-center gap-2 min-w-0", isHome ? "justify-end" : "justify-end")}>
        {isHome && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-right min-w-0">
              <p className="text-xs font-semibold text-[var(--color-slate-200)] truncate">{event.playerName}</p>
              {event.assistName && (
                <p className="text-[10px] text-[var(--color-slate-500)] truncate">asist. {event.assistName}</p>
              )}
            </div>
            <div className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm",
              style.color, "bg-white/[0.04]"
            )}>
              {style.icon}
            </div>
          </div>
        )}
      </div>

      {/* Center: minute + timeline node */}
      <div className="relative flex flex-col items-center w-12 shrink-0">
        {/* Vertical line segment */}
        {!isFirst && <div className="absolute top-0 bottom-1/2 w-px bg-white/[0.08]" />}
        {!isLast && <div className="absolute top-1/2 bottom-0 w-px bg-white/[0.08]" />}
        {/* Node */}
        <div className={cn(
          "relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black tabular-nums border-2 border-[var(--color-graphite)]",
          style.bg, "text-[var(--color-void)]"
        )}>
          {event.minute}'
        </div>
      </div>

      {/* Away side (right) */}
      <div className={cn("flex-1 flex items-center gap-2 min-w-0", !isHome ? "justify-start" : "justify-start")}>
        {!isHome && (
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm",
              style.color, "bg-white/[0.04]"
            )}>
              {style.icon}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-semibold text-[var(--color-slate-200)] truncate">{event.playerName}</p>
              {event.assistName && (
                <p className="text-[10px] text-[var(--color-slate-500)] truncate">asist. {event.assistName}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function EventTimeline({ events, match }: EventTimelineProps) {
  const { t } = useTranslation();
  if (events.length === 0) {
    return (
      <GlassCard variant="soft" className="p-8 text-center">
        <p className="text-sm text-[var(--color-slate-400)]">No hay eventos registrados todavía.</p>
      </GlassCard>
    );
  }

  const homeId = match?.homeTeam.id ?? "";
  const sorted = [...events].sort((a, b) => a.minute - b.minute);

  const firstHalf = sorted.filter((e) => e.minute <= 45);
  const secondHalf = sorted.filter((e) => e.minute > 45 && e.minute <= 90);
  const extraTime = sorted.filter((e) => e.minute > 90);

  const renderHalf = (label: string, tone: "cyan" | "magenta" | "default", items: MatchEvent[]) => {
    if (items.length === 0) return null;
    return (
      <div>
        <Badge tone={tone} className="mb-3">{t(label)}</Badge>
        <div className="space-y-3">
          {items.map((e, i) => (
            <EventRow
              key={e.id}
              event={e}
              homeId={homeId}
              isFirst={i === 0}
              isLast={i === items.length - 1}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <GlassCard variant="soft" className="p-4 space-y-5">
      {renderHalf("1er Tiempo", "cyan", firstHalf)}
      {renderHalf("2do Tiempo", "magenta", secondHalf)}
      {extraTime.length > 0 && renderHalf("Tiempo extra", "default", extraTime)}
    </GlassCard>
  );
}
