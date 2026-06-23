import { motion } from "framer-motion";
import { ChevronRight, Trophy } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { MatchRow } from "./MatchRow";
import type { MatchGroup } from "@/lib/types";

interface MatchGroupCardProps {
  group: MatchGroup;
  showLink?: boolean;
  index?: number;
}

export default function MatchGroupCard({ group, showLink, index = 0 }: MatchGroupCardProps) {
  const liveCount = group.matches.filter((m) => m.status === "live").length;
  const hasLive = liveCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      layout
    >
      <GlassCard
        className={cn(
          "overflow-hidden",
          hasLive && "border-[var(--color-live)]/20"
        )}
        glow={hasLive ? "magenta" : "none"}
      >
        {/* Tournament header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <Link
            href={`/tournament/${group.tournament.slug}`}
            className="flex items-center gap-2.5 group"
          >
            <span className="text-lg">{group.tournament.flag}</span>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-slate-100)] group-hover:text-[var(--color-lime-400)] transition-colors">
                {group.tournament.name}
              </h3>
              {group.round && (
                <p className="text-[11px] text-[var(--color-slate-500)]">{group.round}</p>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {hasLive && (
              <Badge tone="live" pulse>
                {liveCount} vivos
              </Badge>
            )}
            {showLink && (
              <Link href={`/tournament/${group.tournament.slug}`}>
                <ChevronRight size={16} className="text-[var(--color-slate-500)] hover:text-[var(--color-lime-400)] transition-colors" />
              </Link>
            )}
          </div>
        </div>

        {/* Match rows */}
        <div className="divide-y divide-white/[0.03]">
          {group.matches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}
