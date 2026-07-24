/**
 * Trending topics from multiple free sources:
 * - Google Trends RSS (Argentina)
 * - Google News RSS (football)
 * - YouTube RSS (Argentine football channels)
 * - Reddit JSON (r/soccer, r/argentina)
 *
 * All sources are free, no API keys needed.
 */

import RssParser from "rss-parser";

const parser = new RssParser({
  timeout: 8000,
  headers: { "User-Agent": "Tribuna/1.0" },
});

// ---------- Types ----------

export interface TrendingItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: "google_trends" | "google_news" | "youtube" | "reddit";
  publishedAt: string;
  publishedAgo: string | null;
  score: number;
  tags: string[];
  meta: Record<string, string>;
}

export interface TrendingTopic {
  slug: string;
  title: string;
  description: string;
  count: number;
  sources: string[];
  topItems: TrendingItem[];
}

export interface TrendingResponse {
  topics: TrendingTopic[];
  items: TrendingItem[];
  lastUpdated: string;
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

// ---------- Helpers ----------

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function extractFootballKeywords(text: string): string[] {
  const footballTerms = [
    "messi", "ronaldo", "boca", "river", "racing", "san lorenzo", "independiente",
    "argentina", "brasil", "mundial", "copa", "libertadores", "sudamericana",
    "champions", "liga", "premier", "la liga", "bundesliga", "serie a",
    "futbol", "fútbol", "gol", "transferencia", "fichaje", "dt", "entrenador",
    "penal", "tarjeta", "expulsión", "lesión", "fixture", "posiciones",
    "goleador", "campeonato", "ascenso", "descenso", "reclasificación",
  ];
  const lower = text.toLowerCase();
  return footballTerms.filter((t) => lower.includes(t)).slice(0, 5);
}

function isFootballRelated(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return extractFootballKeywords(text).length > 0;
}

// ---------- Source: Google Trends RSS ----------

async function fetchGoogleTrends(): Promise<TrendingItem[]> {
  try {
    const feed = await parser.parseURL(
      "https://trends.google.com/trending/rss?geo=AR"
    );
    return feed.items.slice(0, 30).map((item, i) => ({
      id: `gt-${Date.now()}-${i}`,
      title: item.title ?? "Sin título",
      description: item.contentSnippet ?? item.content ?? "",
      url: item.link ?? "#",
      imageUrl: null,
      source: "google_trends" as const,
      publishedAt: item.pubDate ?? new Date().toISOString(),
      publishedAgo: item.pubDate ? relativeAgo(item.pubDate) : null,
      score: 30 - i,
      tags: extractFootballKeywords(`${item.title ?? ""} ${item.contentSnippet ?? ""}`),
      meta: {},
    }));
  } catch (err) {
    console.error("[trends] Google Trends RSS failed:", err);
    return [];
  }
}

// ---------- Source: Google News RSS ----------

async function fetchGoogleNews(): Promise<TrendingItem[]> {
  const queries = [
    "futbol argentino",
    "mundial 2026",
    "copa libertadores",
    "liga profesional argentina",
  ];
  const results: TrendingItem[] = [];

  for (const q of queries) {
    try {
      const feed = await parser.parseURL(
        `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=es-419&gl=AR&ceid=AR:es-419`
      );
      for (let i = 0; i < Math.min(10, feed.items.length); i++) {
        const item = feed.items[i];
        const title = item.title ?? "Sin título";
        const desc = item.contentSnippet ?? item.content ?? "";
        results.push({
          id: `gn-${q}-${i}`,
          title,
          description: desc,
          url: item.link ?? "#",
          imageUrl: null,
          source: "google_news" as const,
          publishedAt: item.pubDate ?? new Date().toISOString(),
          publishedAgo: item.pubDate ? relativeAgo(item.pubDate) : null,
          score: 25 - i,
          tags: extractFootballKeywords(`${title} ${desc}`),
          meta: { query: q, publisher: item.creator ?? "" },
        });
      }
    } catch (err) {
      console.error(`[trends] Google News "${q}" failed:`, err);
    }
  }

  const seen = new Set<string>();
  return results.filter((item) => {
    const key = item.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ---------- Source: YouTube RSS ----------

const YOUTUBE_CHANNELS = [
  { id: "UC72ZaBKI-Bo5fjmWEYonhJw", name: "TyC Sports" },
];

async function fetchYouTube(): Promise<TrendingItem[]> {
  const results: TrendingItem[] = [];

  for (const ch of YOUTUBE_CHANNELS) {
    try {
      const feed = await parser.parseURL(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${ch.id}`
      );
      for (let i = 0; i < Math.min(5, feed.items.length); i++) {
        const item = feed.items[i];
        const title = item.title ?? "Sin título";
        results.push({
          id: `yt-${ch.id}-${i}`,
          title,
          description: item.contentSnippet ?? "",
          url: item.link ?? "#",
          imageUrl: null,
          source: "youtube" as const,
          publishedAt: item.pubDate ?? new Date().toISOString(),
          publishedAgo: item.pubDate ? relativeAgo(item.pubDate) : null,
          score: 20 - i,
          tags: extractFootballKeywords(title),
          meta: { channel: ch.name },
        });
      }
    } catch (err) {
      console.error(`[trends] YouTube ${ch.name} failed:`, err);
    }
  }

  return results;
}

// ---------- Source: RSS News Feeds ----------

const RSS_FEEDS: { name: string; url: string }[] = [
  { name: "Olé", url: "https://www.ole.com.ar/rss/" },
  { name: "Marca", url: "https://e00-marca.uecdn.es/rss/futbol.xml" },
  { name: "ESPN Argentina", url: "https://www.espn.com.ar/espn/rss/futbol" },
];

async function fetchRSSFeeds(): Promise<TrendingItem[]> {
  const results: TrendingItem[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (let i = 0; i < Math.min(15, parsed.items.length); i++) {
        const item = parsed.items[i];
        const title = item.title ?? "Sin título";
        const desc = item.contentSnippet ?? item.content ?? "";
        if (!isFootballRelated(title, desc)) continue;
        results.push({
          id: `rss-${feed.name}-${i}`,
          title,
          description: desc,
          url: item.link ?? "#",
          imageUrl: null,
          source: "google_news" as const,
          publishedAt: item.pubDate ?? new Date().toISOString(),
          publishedAgo: item.pubDate ? relativeAgo(item.pubDate) : null,
          score: 20 - i,
          tags: extractFootballKeywords(`${title} ${desc}`),
          meta: { publisher: feed.name },
        });
      }
    } catch (err) {
      console.error(`[trends] RSS feed ${feed.name} failed:`, err);
    }
  }

  const seen = new Set<string>();
  return results.filter((item) => {
    const key = item.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ---------- Aggregate & group ----------

function groupIntoTopics(items: TrendingItem[]): TrendingTopic[] {
  const tagMap = new Map<string, TrendingItem[]>();

  for (const item of items) {
    for (const tag of item.tags) {
      const slug = slugify(tag);
      if (!tagMap.has(slug)) tagMap.set(slug, []);
      tagMap.get(slug)!.push(item);
    }
  }

  const topics: TrendingTopic[] = [];
  for (const [slug, topicItems] of tagMap) {
    if (topicItems.length < 2) continue;
    topicItems.sort((a, b) => b.score - a.score);
    const sources = [...new Set(topicItems.map((i) => i.source))];
    topics.push({
      slug,
      title: topicItems[0].tags[0] ?? slug,
      description: topicItems
        .slice(0, 3)
        .map((i) => i.title)
        .join(" · "),
      count: topicItems.length,
      sources,
      topItems: topicItems.slice(0, 5),
    });
  }

  topics.sort((a, b) => b.count - a.count);
  return topics.slice(0, 20);
}

// ---------- Main export ----------

export async function fetchTrending(): Promise<TrendingResponse> {
  const cacheKey = "trending:all";
  const cached = getCache<TrendingResponse>(cacheKey);
  if (cached) return cached;

  const [googleTrends, googleNews, youtube, rssFeeds] = await Promise.allSettled([
    fetchGoogleTrends(),
    fetchGoogleNews(),
    fetchYouTube(),
    fetchRSSFeeds(),
  ]);

  const allItems: TrendingItem[] = [];
  if (googleTrends.status === "fulfilled") allItems.push(...googleTrends.value);
  if (googleNews.status === "fulfilled") allItems.push(...googleNews.value);
  if (youtube.status === "fulfilled") allItems.push(...youtube.value);
  if (rssFeeds.status === "fulfilled") allItems.push(...rssFeeds.value);

  const filtered = allItems.filter((item) => {
    if (item.source === "google_news" || item.source === "youtube") return true;
    return item.tags.length > 0;
  });

  const topics = groupIntoTopics(filtered);

  const response: TrendingResponse = {
    topics,
    items: filtered.slice(0, 50),
    lastUpdated: new Date().toISOString(),
  };

  if (filtered.length > 0) {
    setCache(cacheKey, response, 30 * 60_000);
  }
  return response;
}

export async function fetchTrendingTopic(
  slug: string
): Promise<TrendingTopic | null> {
  const trending = await fetchTrending();
  return trending.topics.find((t) => t.slug === slug) ?? null;
}

export function trendingToRSS(items: TrendingItem[]): string {
  const entries = items
    .map(
      (item) => `  <item>
    <title>${escapeXml(item.title)}</title>
    <description>${escapeXml(item.description)}</description>
    <link>${escapeXml(item.url)}</link>
    <pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>
    <category>${escapeXml(item.source)}</category>
  </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Tribuna — Fútbol Trending</title>
  <link>https://tribuna-8b8r.onrender.com/tendencias</link>
  <description>Lo más buscado sobre fútbol en Argentina y el mundo</description>
  <language>es-ar</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="https://tribuna-8b8r.onrender.com/api/trending/rss" rel="self" type="application/rss+xml" />
${entries}
</channel>
</rss>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
