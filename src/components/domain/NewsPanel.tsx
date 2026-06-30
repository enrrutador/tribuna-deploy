import { useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Clock, Flame, Radio, AlertTriangle, ServerOff } from "lucide-react";
import { useNews } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { fallbackNews } from "@/lib/newsFallback";
import type { NewsItem } from "@/lib/types";

interface NewsPanelProps {
  className?: string;
}

/** Single news card with image and glassmorphism overlay. */
function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const isFeatured = index === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="group cursor-pointer"
    >
      <a href={item.url} target="_blank" rel="noopener noreferrer">
        <GlassCard
          variant="soft"
          hover
          className={cn(
            "overflow-hidden",
            isFeatured && "row-span-2"
          )}
        >
          {/* Image */}
          <div className="relative overflow-hidden">
            <div className={cn(
              "bg-[var(--color-slate-800)]",
              isFeatured ? "aspect-[16/9]" : "aspect-[16/8]"
            )}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  width="300" height="200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl">
                  {item.category === "mundial" ? "🌍" : item.category === "argentina" ? "🇦🇷" : "⚽"}
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-transparent to-transparent" />
            </div>

            {/* Category badge */}
            <div className="absolute top-2.5 left-2.5">
              <Badge
                tone={item.category === "mundial" ? "lime" : item.category === "argentina" ? "cyan" : "magenta"}
                className="text-[9px] backdrop-blur-md"
              >
                {item.category === "mundial" ? "🌍 Internacional" : item.category === "argentina" ? "🇦🇷 Argentina" : "⚽ Fútbol"}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-3.5">
            <h3 className={cn(
              "font-bold leading-snug text-[var(--color-slate-100)] group-hover:text-white transition-colors",
              isFeatured ? "text-[15px]" : "text-[13px]"
            )}>
              {item.title}
            </h3>

            {isFeatured && item.description && (
              <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--color-slate-400)] line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Footer meta */}
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-[var(--color-slate-500)]">
                <Clock size={10} />
                <span>{item.publishedAgo ?? "hoy"}</span>
                <span className="text-[var(--color-slate-700)]">·</span>
                <span>{item.source}</span>
              </div>
              <ExternalLink
                size={12}
                className="text-[var(--color-slate-600)] opacity-0 transition-all group-hover:opacity-100 group-hover:text-[var(--color-lime-400)]"
              />
            </div>
          </div>
        </GlassCard>
      </a>
    </motion.article>
  );
}

export default function NewsPanel({ className }: NewsPanelProps) {
  const { data, isLoading, error, refetch, isFetching } = useNews();
  const [useFallback, setUseFallback] = useState(false);

  // Determine what news to show
  const serverNews = data?.news ?? [];
  const hasServerError = !!error;
  const isServerUnavailable = hasServerError || (data === undefined && !isLoading);
  
  // Use fallback when: server is unavailable OR user explicitly chose fallback mode
  const news = (isServerUnavailable || useFallback) && !isLoading 
    ? fallbackNews 
    : serverNews;

  // Determine current mode for UI indicators
  const isFallbackMode = isServerUnavailable || useFallback;

  return (
    <div className={cn("space-y-4", className)}>
      <SectionTitle
        icon={<Newspaper size={18} />}
        title="Noticias"
        subtitle={`${news.length} artículos${isFallbackMode ? " (demo)" : ""}`}
        accent="magenta"
        action={
          isFetching ? (
            <Spinner size={14} />
          ) : (
            <button
              onClick={() => { setUseFallback(false); refetch(); }}
              className="text-[11px] text-[var(--color-slate-500)] hover:text-[var(--color-lime-400)] transition-colors"
            >
              Actualizar
            </button>
          )
        }
      />

      {/* Server error warning */}
      {hasServerError && !isLoading && !useFallback && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[var(--color-magenta-500)]/20 bg-[var(--color-magenta-500)]/5 p-3"
        >
          <div className="flex items-start gap-2.5">
            <ServerOff size={16} className="mt-0.5 shrink-0 text-[var(--color-magenta-400)]" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--color-slate-200)]">
                Servidor no disponible
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--color-slate-500)] leading-relaxed">
                No se pudo conectar al backend. Asegurate de tener corriendo <code className="px-1 py-0.5 rounded bg-[var(--color-slate-900)] text-[var(--color-lime-400)] text-[10px]">npm run dev:server</code>.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => refetch()}
                  className="text-[11px] font-semibold text-[var(--color-lime-400)] hover:text-[var(--color-lime-300)] transition-colors"
                >
                  Reintentar
                </button>
                <span className="text-[var(--color-slate-600)]">·</span>
                <button
                  onClick={() => setUseFallback(true)}
                  className="text-[11px] font-semibold text-[var(--color-cyan-400)] hover:text-[var(--color-cyan-300)] transition-colors"
                >
                  Ver modo demo
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Fallback mode indicator */}
      {isFallbackMode && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[var(--color-cyan-500)]/20 bg-[var(--color-cyan-500)]/8 p-2.5"
        >
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-[var(--color-cyan-400)]" />
            <p className="text-[11px] text-[var(--color-slate-300)]">
              Mostrando datos de demostración. <button
                onClick={() => { setUseFallback(false); refetch(); }}
                className="font-semibold text-[var(--color-lime-400)] hover:underline"
              >
                Intentar conectar al servidor
              </button>
            </p>
          </div>
        </motion.div>
      )}

      {/* Trending topics bar */}
      {news.length > 0 && !isFallbackMode && (
        <div className="flex items-center gap-2 flex-wrap">
          <Flame size={12} className="text-[var(--color-magenta-400)]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-slate-500)]">En tendencia:</span>
          {news.slice(0, 3).map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-soft rounded-full px-2.5 py-1 text-[10px] font-semibold text-[var(--color-slate-300)] transition-all hover:bg-white/10 hover:text-[var(--color-lime-400)]"
            >
              {item.title.length > 35 ? item.title.slice(0, 35) + "…" : item.title}
            </a>
          ))}
        </div>
      )}

      {/* News grid */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-xl p-0 overflow-hidden">
              <div className="shimmer aspect-[16/8]" />
              <div className="p-3 space-y-2">
                <div className="shimmer h-3 w-3/4 rounded" />
                <div className="shimmer h-2.5 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : news.length === 0 && !hasServerError ? (
        <GlassCard variant="soft" className="p-8 text-center">
          <Newspaper size={24} className="mx-auto text-[var(--color-slate-600)] mb-2" />
          <p className="text-xs text-[var(--color-slate-500)]">No hay noticias disponibles ahora.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-3 lg:grid-cols-1">
          {news.slice(0, 8).map((item, i) => (
            <NewsCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
