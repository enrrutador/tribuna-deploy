import { Link } from "wouter";
import { motion } from "framer-motion";
import { TrendingUp, ExternalLink, MessageSquare, Play, Newspaper, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrendingItem } from "@/lib/types";

interface TrendingCardProps {
  title: string;
  slug: string;
  count: number;
  sources: string[];
  items: TrendingItem[];
  className?: string;
}

const sourceConfig: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  google_trends: { icon: Search, color: "text-blue-400", label: "Google Trends" },
  google_news: { icon: Newspaper, color: "text-green-400", label: "Google News" },
  youtube: { icon: Play, color: "text-red-400", label: "YouTube" },
  reddit: { icon: MessageSquare, color: "text-orange-400", label: "Reddit" },
};

export default function TrendingCard({ title, slug, count, sources, items, className }: TrendingCardProps) {
  return (
    <Link href={`/tendencias/${slug}`}>
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        className={cn(
          "group cursor-pointer rounded-2xl border border-white/5 bg-[var(--color-carbon)]/80 p-4 backdrop-blur-sm transition-all hover:border-lime-500/20 hover:bg-white/5",
          className
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-lime-400" />
            <h3 className="text-sm font-bold text-white capitalize">{title}</h3>
          </div>
          <span className="rounded-full bg-lime-400/10 px-2 py-0.5 text-xs font-medium text-lime-400">
            {count} fuentes
          </span>
        </div>

        <div className="flex gap-1.5 mb-3">
          {sources.map((src) => {
            const cfg = sourceConfig[src];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <span
                key={src}
                className={cn("flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium", cfg.color)}
              >
                <Icon className="h-3 w-3" />
                {cfg.label}
              </span>
            );
          })}
        </div>

        <div className="space-y-2">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-start gap-2 text-xs text-white/60">
              <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-lime-400/50" />
              <span className="line-clamp-2 leading-relaxed">{item.title}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-lime-400/70 transition-colors group-hover:text-lime-400">
          Ver más
          <ExternalLink className="h-3 w-3" />
        </div>
      </motion.div>
    </Link>
  );
}
