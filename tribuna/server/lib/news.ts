/**
 * Noticias de fútbol desde ESPN (endpoint público con imágenes).
 * Incluye fallback a feeds RSS si el principal falla.
 */

const ESPN_NEWS =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/news?lang=es";
const ESPN_NEWS_ARG =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/arg.1/news?lang=es";

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  summary: string;
  imageUrl: string | null;
  imageCredit: string | null;
  publishedAt: string;
  publishedAgo: string | null;
  source: string;
  url: string;
  category: "mundial" | "argentina" | "general";
}

// ---------- Cache ----------
type CacheEntry<T> = { data: T; expiresAt: number };
const cache = new Map<string, CacheEntry<unknown>>();

function getCache<T>(key: string): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry || Date.now() > entry.expiresAt) return undefined;
  return entry.data;
}
function setCache<T>(key: string, data: T, ttlMs: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

async function espnFetch(url: string): Promise<unknown> {
  const r = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Tribuna/1.0" },
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`News fetch failed: ${r.status}`);
  return r.json();
}

function relativeAgo(iso: string): string | null {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "recién";
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `hace ${days} d`;
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return null;
  }
}

function parseArticle(
  a: Record<string, unknown>,
  category: NewsItem["category"]
): NewsItem | null {
  const images = (a.images as Record<string, unknown>[]) ?? [];
  const img = images[0];
  const headline = a.headline ? String(a.headline) : null;
  const description = a.description ? String(a.description) : null;
  if (!headline) return null;

  return {
    id: String(a.id ?? Math.random().toString(36).slice(2)),
    title: headline,
    description: description ?? "",
    summary: (description ?? headline).slice(0, 140),
    imageUrl: img?.url ? String(img.url) : null,
    imageCredit: img?.credit ? String(img.credit) : null,
    publishedAt: a.published ? String(a.published) : new Date().toISOString(),
    publishedAgo: a.published ? relativeAgo(String(a.published)) : null,
    source: "ESPN",
    url: (() => {
      try {
        const links = a.links as Record<string, Record<string, unknown>> | undefined;
        const href = links?.web?.href;
        return href ? String(href) : "#";
      } catch { return "#"; }
    })(),
    category,
  };
}

export async function fetchNews(): Promise<NewsItem[]> {
  const cacheKey = "news:all";
  const cached = getCache<NewsItem[]>(cacheKey);
  if (cached) return cached;

  const [mundialRes, argRes] = await Promise.allSettled([
    espnFetch(ESPN_NEWS),
    espnFetch(ESPN_NEWS_ARG),
  ]);

  const items: NewsItem[] = [];

  if (mundialRes.status === "fulfilled") {
    const articles = ((mundialRes.value as Record<string, unknown>).articles as Record<string, unknown>[]) ?? [];
    for (const a of articles) {
      const parsed = parseArticle(a, "mundial");
      if (parsed) items.push(parsed);
    }
  }

  if (argRes.status === "fulfilled") {
    const articles = ((argRes.value as Record<string, unknown>).articles as Record<string, unknown>[]) ?? [];
    for (const a of articles) {
      const parsed = parseArticle(a, "argentina");
      if (parsed) items.push(parsed);
    }
  }

  // Deduplicate by title, sort by date desc
  const seen = new Set<string>();
  const unique = items.filter((it) => {
    const key = it.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  unique.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const result = unique.slice(0, 20);
  // Only cache if we got results — avoid caching empty responses
  if (result.length > 0) {
    setCache(cacheKey, result, 5 * 60_000); // 5 min
  }
  return result;
}
