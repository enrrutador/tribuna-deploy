import * as cheerio from "cheerio";
import RssParser from "rss-parser";
import { logger } from "./logger";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

type CacheEntry<T> = { data: T; expiresAt: number };
const newsCache = new Map<string, CacheEntry<unknown>>();

function getNewsCache<T>(key: string): T | undefined {
  const entry = newsCache.get(key) as CacheEntry<T> | undefined;
  if (!entry || Date.now() > entry.expiresAt) return undefined;
  return entry.data;
}

function setNewsCache<T>(key: string, data: T, ttlMs: number) {
  newsCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

const NEWS_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
};

async function newsFetch(url: string): Promise<string> {
  try {
    const args = [
      "-s", "-L", "--max-time", "12",
      "-H", "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "-H", "Accept-Language: es-AR,es;q=0.9,en;q=0.8",
      url,
    ];
    const { stdout } = await execFileAsync("curl", args, { timeout: 15_000, maxBuffer: 10 * 1024 * 1024 });
    return stdout;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`News fetch failed: ${msg} ${url}`);
  }
}

export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string | null;
  source: string;
  sourceIcon: string | null;
  publishedAt: string;
  category: string;
  isFeatured: boolean;
};

const RSS_FEEDS: { url: string; source: string; category: string; icon: string }[] = [
  { url: "https://www.espn.com.ar/futbol/rss", source: "ESPN Argentina", category: "argentina", icon: "https://www.espn.com.ar/favicon.ico" },
];

export async function fetchRSSNews(): Promise<NewsArticle[]> {
  const cacheKey = "rss-news";
  const cached = getNewsCache<NewsArticle[]>(cacheKey);
  if (cached) return cached;

  const parser = new RssParser();
  const allArticles: NewsArticle[] = [];

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      try {
        const output = await parser.parseURL(feed.url);
        return output.items.map((item, idx): NewsArticle => ({
          id: `rss-${feed.source}-${idx}`,
          title: item.title ?? "",
          summary: item.contentSnippet ?? item.content ?? "",
          url: item.link ?? "",
          imageUrl: item.enclosure?.url ?? extractImageFromContent(item.content ?? "") ?? null,
          source: feed.source,
          sourceIcon: feed.icon,
          publishedAt: item.pubDate ?? item.isoDate ?? new Date().toISOString(),
          category: feed.category,
          isFeatured: idx === 0,
        }));
      } catch {
        return [];
      }
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled") allArticles.push(...r.value);
  }

  allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  setNewsCache(cacheKey, allArticles, 5 * 60_000);
  return allArticles;
}

function extractImageFromContent(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/);
  return match?.[1] ?? null;
}

export async function fetchTyCHeadlines(): Promise<NewsArticle[]> {
  const cacheKey = "tyc-headlines";
  const cached = getNewsCache<NewsArticle[]>(cacheKey);
  if (cached) return cached;

  try {
    const html = await newsFetch("https://www.tycsports.com/futbol");
    const $ = cheerio.load(html);
    const articles: NewsArticle[] = [];

    $("article, .article-card, .news-card, .card-nota, .nota").each((idx, el) => {
      try {
        const titleEl = $(el).find("h2 a, h3 a, .title a, a").first();
        const title = titleEl.text().trim() || $(el).find("h2, h3, .title").first().text().trim();
        if (!title) return;

        const link = titleEl.attr("href") ?? $(el).find("a").first().attr("href") ?? "";
        const url = link.startsWith("http") ? link : `https://www.tycsports.com${link}`;

        const imgEl = $(el).find("img").first();
        const imageUrl = imgEl.attr("src") ?? imgEl.attr("data-src") ?? null;

        const summaryEl = $(el).find(".description, .excerpt, .copete, p").first();
        const summary = summaryEl.text().trim();

        articles.push({
          id: `tyc-${idx}`,
          title,
          summary,
          url,
          imageUrl,
          source: "TyC Sports",
          sourceIcon: "https://www.tycsports.com/favicon.ico",
          publishedAt: new Date().toISOString(),
          category: "argentina",
          isFeatured: idx === 0,
        });
      } catch {
        // skip
      }
    });

    if (articles.length === 0) {
      $(".entry-title a, .entry a, .nota-title a").each((idx, el) => {
        const title = $(el).text().trim();
        if (!title) return;
        const link = $(el).attr("href") ?? "";
        const url = link.startsWith("http") ? link : `https://www.tycsports.com${link}`;

        articles.push({
          id: `tyc-fallback-${idx}`,
          title,
          summary: "",
          url,
          imageUrl: null,
          source: "TyC Sports",
          sourceIcon: "https://www.tycsports.com/favicon.ico",
          publishedAt: new Date().toISOString(),
          category: "argentina",
          isFeatured: idx === 0,
        });
      });
    }

    setNewsCache(cacheKey, articles, 5 * 60_000);
    return articles;
  } catch (err) {
    logger.error({ err }, "TyC Sports headlines fetch failed");
    return [];
  }
}

export async function fetchOleHeadlines(): Promise<NewsArticle[]> {
  const cacheKey = "ole-headlines";
  const cached = getNewsCache<NewsArticle[]>(cacheKey);
  if (cached) return cached;

  try {
      const html = await newsFetch("https://www.ole.com.ar/futbol-primera");
    const $ = cheerio.load(html);
    const articles: NewsArticle[] = [];

    $("article, .article, .nota, .entry").each((idx, el) => {
      try {
        const titleEl = $(el).find("h2 a, h3 a, .title a, a").first();
        const title = titleEl.text().trim() || $(el).find("h2, h3, .title").first().text().trim();
        if (!title) return;

        const link = titleEl.attr("href") ?? $(el).find("a").first().attr("href") ?? "";
        const url = link.startsWith("http") ? link : `https://www.ole.com.ar${link}`;

        const imgEl = $(el).find("img").first();
        const imageUrl = imgEl.attr("src") ?? imgEl.attr("data-src") ?? null;

        const summaryEl = $(el).find(".description, .excerpt, .copete, p").first();
        const summary = summaryEl.text().trim();

        articles.push({
          id: `ole-${idx}`,
          title,
          summary,
          url,
          imageUrl,
          source: "Olé",
          sourceIcon: "https://www.ole.com.ar/favicon.ico",
          publishedAt: new Date().toISOString(),
          category: "argentina",
          isFeatured: idx === 0,
        });
      } catch {
        // skip
      }
    });

    setNewsCache(cacheKey, articles, 5 * 60_000);
    return articles;
  } catch (err) {
    logger.error({ err }, "Olé headlines fetch failed");
    return [];
  }
}

export async function fetchAllNews(): Promise<NewsArticle[]> {
  const cacheKey = "all-news";
  const cached = getNewsCache<NewsArticle[]>(cacheKey);
  if (cached) return cached;

  try {
    const [rssArticles, tycArticles, oleArticles] = await Promise.allSettled([
      fetchRSSNews(),
      fetchTyCHeadlines(),
      fetchOleHeadlines(),
    ]);

    const all: NewsArticle[] = [];
    if (rssArticles.status === "fulfilled") all.push(...rssArticles.value);
    if (tycArticles.status === "fulfilled") all.push(...tycArticles.value);
    if (oleArticles.status === "fulfilled") all.push(...oleArticles.value);

    const seen = new Set<string>();
    const deduped = all.filter((a) => {
      const key = a.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    setNewsCache(cacheKey, deduped, 3 * 60_000);
    return deduped;
  } catch (err) {
    logger.error({ err }, "All news fetch failed");
    return [];
  }
}
