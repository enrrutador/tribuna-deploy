import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNews } from "@/lib/hooks";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface NewsFilterProps {
  initialCategory?: string;
}

const CATEGORIES = [
  { id: "general", label: "General" },
  { id: "mundial", label: "Mundial" },
  { id: "argentina", label: "Argentina" },
];

export default function NewsFilter({ initialCategory }: NewsFilterProps) {
  const [category, setCategory] = useState(initialCategory ?? "general");
  const { data: response, isLoading } = useNews(category === "general" ? undefined : category);
  const news = response?.news ?? [];

  return (
    <div className="space-y-4">
      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all",
              category === cat.id
                ? "bg-[var(--color-lime-400)] text-black"
                : "bg-white/[0.04] text-[var(--color-slate-400)] hover:bg-white/[0.08]"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* News list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          {isLoading && (
            <GlassCard variant="soft" className="p-4 text-center">
              <p className="text-xs text-[var(--color-slate-400)]">Cargando noticias...</p>
            </GlassCard>
          )}

          {!isLoading && news.length === 0 && (
            <GlassCard variant="soft" className="p-4 text-center">
              <p className="text-xs text-[var(--color-slate-400)]">No hay noticias disponibles</p>
            </GlassCard>
          )}

          {!isLoading && news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <GlassCard variant="soft" className="p-3 hover:border-[var(--color-lime-400)]/20 transition-all">
                <div className="flex gap-3">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" loading="lazy" width="64" height="48" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--color-slate-100)] group-hover:text-[var(--color-lime-400)] transition-colors line-clamp-2">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-[var(--color-slate-500)]">{item.source}</span>
                      {item.publishedAgo && <span className="text-[9px] text-[var(--color-slate-600)]">· {item.publishedAgo}</span>}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </a>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
