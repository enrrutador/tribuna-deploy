import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import type { MatchEvent, Match } from "@/lib/types";

interface EventTimelineProps {
  events: MatchEvent[];
  match?: Match;
}

const EVENT_ICONS: Record<string, { icon: string; color: string }> = {
  goal:        { icon: "⚽", color: "text-[var(--color-lime-400)]" },
  owngoal:     { icon: "⚽", color: "text-[var(--color-danger)]" },
  penalty:     { icon: "⚽", color: "text-[var(--color-lime-400)]" },
  penalty_miss:{ icon: "❌", color: "text-[var(--color-warn)]" },
  yellow_card: { icon: "🟨", color: "text-[var(--color-warn)]" },
  red_card:    { icon: "🟥", color: "text-[var(--color-danger)]" },
  substitution:{ icon: "🔄", color: "text-[var(--color-cyan-400)]" },
  var_review:  { icon: "📺", color: "text-[var(--color-magenta-400)]" },
};

function EventRow({ event, homeId, isFirst }: { event: MatchEvent; homeId: string; isFirst: boolean }) {
  const isHome = event.teamId === homeId;
  const style = EVENT_ICONS[event.type] ?? EVENT_ICONS.goal!;
  const homeName = event.teamName;

  return (
    <motion.div
      initial={{ opacity: 0, x: isHome ? -12 : 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: isFirst ? 0 : 0.05, duration: 0.3 }}
      className="flex items-center gap-3 py-2.5 group"
    >
      {/* Home side */}
      <div className={cn("flex-1 flex items-center gap-2", isHome ? "justify-end" : "justify-start opacity-0 h-0")}>
        {isHome && (
          <>
            <span className="text-xs text-[var(--color-slate-400)] text-right truncate max-w-[140px]">
              {event.playerName && (
                <span className="font-semibold text-[var(--color-slate-200)]">{event.playerName}</span>
              )}
              {event.assistName && (
                <span className="ml-1 text-[var(--color-slate-500)]">(asist. {event.assistName})</span>
              )}
            </span>
            <span className={cn("text-base", style.color)}>{style.icon}</span>
          </>
        )}
      </div>

      {/* Minute (center) */}
      <div className="flex w-10 shrink-0 items-center justify-center">
        <span className="text-[11px] font-bold tabular-nums text-[var(--color-slate-400)]">
          {event.minute}'
        </span>
      </div>

      {/* Away side */}
      <div className={cn("flex-1 flex items-center gap-2", !isHome ? "justify-start" : "justify-end opacity-0 h-0")}>
        {!isHome && (
          <>
            <span className={cn("text-base", style.color)}>{style.icon}</span>
            <span className="text-xs text-[var(--color-slate-400)] truncate max-w-[140px]">
              {event.playerName && (
                <span className="font-semibold text-[var(--color-slate-200)]">{event.playerName}</span>
              )}
              {event.assistName && (
                <span className="ml-1 text-[var(--color-slate-500)]">(asist. {event.assistName})</span>
              )}
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function EventTimeline({ events, match }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <GlassCard variant="soft" className="p-8 text-center">
        <p className="text-sm text-[var(--color-slate-400)]">No hay eventos registrados todavía.</p>
      </GlassCard>
    );
  }

  const homeId = match?.homeTeam.id ?? "";
  const sorted = [...events].sort((a, b) => a.minute - b.minute);

  // Group by half
  const firstHalf = sorted.filter((e) => e.minute <= 45);
  const secondHalf = sorted.filter((e) => e.minute > 45);

  return (
    <div className="space-y-4">
      {firstHalf.length > 0 && (
        <div>
          <Badge tone="cyan" className="mb-2">1er Tiempo</Badge>
          <GlassCard variant="soft" className="px-4 py-1">
            {firstHalf.map((e, i) => (
              <EventRow key={e.id} event={e} homeId={homeId} isFirst={i === 0} />
            ))}
          </GlassCard>
        </div>
      )}
      {secondHalf.length > 0 && (
        <div>
          <Badge tone="magenta" className="mb-2">2do Tiempo</Badge>
          <GlassCard variant="soft" className="px-4 py-1">
            {secondHalf.map((e, i) => (
              <EventRow key={e.id} event={e} homeId={homeId} isFirst={i === 0} />
            ))}
          </GlassCard>
        </div>
      )}
    </div>
  );
}
