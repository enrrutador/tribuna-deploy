import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { TrendingUp, RefreshCw } from "lucide-react";
import { useTrending } from "@/lib/hooks";
import TrendingCard from "@/components/domain/TrendingCard";

export default function Trending() {
  const { data, isLoading, refetch, isFetching } = useTrending();

  return (
    <>
      <Helmet>
        <title>Tribuna — Tendencias de Fútbol en Argentina y el Mundo</title>
        <meta
          name="description"
          content="Descubrí lo más buscado del fútbol argentino y mundial. Tendencias de Google, noticias, videos y discusiones en tiempo real."
        />
        <meta property="og:title" content="Tribuna — Tendencias de Fútbol" />
        <meta
          property="og:description"
          content="Lo más buscado del fútbol argentino y mundial en tiempo real."
        />
        <meta property="og:url" content="https://tribuna-8b8r.onrender.com/tendencias" />
        <link rel="canonical" href="https://tribuna-8b8r.onrender.com/tendencias" />
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-lime-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Tendencias</h1>
              <p className="text-xs text-white/50">
                Lo más buscado sobre fútbol en Argentina y el mundo
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl border border-white/5 bg-white/5"
              />
            ))}
          </div>
        ) : !data?.topics.length ? (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center">
            <TrendingUp className="mx-auto mb-3 h-8 w-8 text-white/20" />
            <p className="text-sm text-white/50">
              No se encontraron tendencias en este momento
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 text-xs text-lime-400 hover:underline"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.topics.map((topic, i) => (
                <motion.div
                  key={topic.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <TrendingCard
                    title={topic.title}
                    slug={topic.slug}
                    count={topic.count}
                    sources={topic.sources}
                    items={topic.topItems}
                  />
                </motion.div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <h2 className="mb-3 text-sm font-bold text-white">Últimas noticias</h2>
              <div className="space-y-2">
                {data.items.slice(0, 10).map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-white/5"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400/50" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white/90 line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-xs text-white/40">
                        {item.source === 'google_trends' && 'Google Trends'}
                        {item.source === 'google_news' && 'Google News'}
                        {item.source === 'youtube' && 'YouTube'}
                        {item.source === 'reddit' && `Reddit r/${item.meta.subreddit ?? ''}`}
                        {item.publishedAgo ? ` · ${item.publishedAgo}` : ''}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <p className="text-center text-[10px] text-white/30">
              Actualizado: {new Date(data.lastUpdated).toLocaleString('es-AR')} · Fuentes: Google Trends, Google News, YouTube, Reddit
            </p>
          </>
        )}
      </div>
    </>
  );
}
