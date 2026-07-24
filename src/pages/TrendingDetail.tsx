import { Link } from "wouter";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { TrendingUp, ExternalLink, ArrowLeft, MessageSquare, Play, Newspaper, Search } from "lucide-react";
import { useTrendingTopic } from "@/lib/hooks";
import type { TrendingItem } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

const sourceConfig: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  google_trends: { icon: Search, color: "text-blue-400", label: "Google Trends" },
  google_news: { icon: Newspaper, color: "text-green-400", label: "Google News" },
  youtube: { icon: Play, color: "text-red-400", label: "YouTube" },
  reddit: { icon: MessageSquare, color: "text-orange-400", label: "Reddit" },
};

function ItemCard({ item }: { item: TrendingItem }) {
const { t } = useTranslation();
  const cfg = sourceConfig[item.source];
  const Icon = cfg?.icon ?? TrendingUp;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-white/5 bg-[var(--color-carbon)]/80 p-4 transition-all hover:border-lime-500/20 hover:bg-white/5"
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-lg bg-white/5 p-2 ${cfg?.color ?? "text-white/50"}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-white/90 line-clamp-2 group-hover:text-lime-400 transition-colors">
            {item.title}
          </h3>
          {item.description && (
            <p className="mt-1 text-xs text-white/40 line-clamp-2">
              {item.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2 text-[10px] text-white/30">
            <span>{cfg?.label ?? item.source}</span>
            {item.publishedAgo && (
              <>
                <span>·</span>
                <span>{item.publishedAgo}</span>
              </>
            )}
            {item.meta.subreddit && (
              <>
                <span>·</span>
                <span>r/{item.meta.subreddit}</span>
              </>
            )}
            {item.meta.upvotes && (
              <>
                <span>·</span>
                <span>▲ {item.meta.upvotes}</span>
              </>
            )}
            {item.meta.channel && (
              <>
                <span>·</span>
                <span>{item.meta.channel}</span>
              </>
            )}
          </div>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-white/20 transition-colors group-hover:text-lime-400" />
      </div>
    </a>
  );
}

export default function TrendingDetail({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { data: topic, isLoading } = useTrendingTopic(slug);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/5" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="space-y-4">
        <Link href="/tendencias" className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver a tendencias
        </Link>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center">
          <TrendingUp className="mx-auto mb-3 h-8 w-8 text-white/20" />
          <p className="text-sm text-white/50">{t("Tema no encontrado")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Tribuna — {topic.title} | Tendencias de Futbol</title>
        <meta
          name="description"
          content={`Lo mas buscado sobre ${topic.title}: noticias, videos y discusiones de futbol en tiempo real.`}
        />
        <meta property="og:title" content={`Tribuna — ${topic.title}`} />
        <meta
          property="og:description"
          content={`Lo mas buscado sobre ${topic.title} en el futbol argentino y mundial.`}
        />
        <meta property="og:url" content={`https://tribuna-8b8r.onrender.com/tendencias/${topic.slug}`} />
        <link rel="canonical" href={`https://tribuna-8b8r.onrender.com/tendencias/${topic.slug}`} />
      </Helmet>
      <div className="space-y-6">
        <div>
          <Link href="/tendencias" className="mb-3 flex items-center gap-1.5 text-xs text-white/50 hover:text-white">
            <ArrowLeft className="h-3 w-3" /> Tendencias
          </Link>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-lime-400" />
            <div>
              <h1 className="text-xl font-bold text-white capitalize">{topic.title}</h1>
              <p className="text-xs text-white/50">
                {topic.count} resultados de {topic.sources.length} fuentes
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-1.5">
            {topic.sources.map((src) => {
              const cfg = sourceConfig[src];
              if (!cfg) return null;
              const Icon = cfg.icon;
              return (
                <span
                  key={src}
                  className={`flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium ${cfg.color}`}
                >
                  <Icon className="h-3 w-3" />
                  {cfg.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {topic.topItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ItemCard item={item} />
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
