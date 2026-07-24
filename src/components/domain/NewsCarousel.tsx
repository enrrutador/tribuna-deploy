import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink, Clock } from "lucide-react";
import { useNews } from "@/lib/hooks";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useTranslation } from "@/lib/i18n";
import type { NewsItem } from "@/lib/types";

export default function NewsCarousel() {
  const { t } = useTranslation();
  const { data } = useNews();
  const allNews = data?.news ?? [];
  const items = allNews.slice(8, 16);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <SectionTitle
        icon={<Clock size={16} />}
        title={t("Últimas noticias")}
        accent="magenta"
      />
      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-4"
          animate={{ x: ["0%", `-${items.length * 280}px`] }}
          transition={{
            duration: items.length * 12,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {[...items, ...items].map((item, i) => (
            <a
              key={`${item.id}-${i}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-[260px] shrink-0"
            >
              <div className="overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] transition-all hover:bg-white/[0.06] hover:border-lime-500/30">
                <div className="aspect-[16/9] bg-[var(--color-slate-800)] overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      width="260" height="146"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">
                      {item.category === "mundial" ? "🌍" : item.category === "argentina" ? "🇦🇷" : "⚽"}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-bold leading-snug text-[var(--color-slate-100)] line-clamp-2 group-hover:text-[var(--color-lime-400)] transition-colors">
                    {item.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--color-slate-500)]">
                    <Clock size={10} />
                    <span>{item.publishedAgo ?? t("hoy")}</span>
                    <span className="text-[var(--color-slate-700)]">·</span>
                    <span>{item.source}</span>
                    <ExternalLink size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-lime-400)]" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </motion.div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--color-void)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--color-void)] to-transparent" />
      </div>
    </div>
  );
}
