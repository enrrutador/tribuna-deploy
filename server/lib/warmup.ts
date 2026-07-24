import { fetchTodayMatches } from "./espn.js";
import { fetchNews } from "./news.js";
import { fetchTrending } from "./trending.js";

/**
 * Precarga los endpoints más pedidos para que el primer usuario
 * no sufra el cold start de las APIs externas.
 */
export async function warmupCache() {
  console.log("[warmup] Precargando cache...");
  const start = Date.now();

  const results = await Promise.allSettled([
    fetchTodayMatches(),
    fetchNews(),
    fetchTrending(),
  ]);

  const ok = results.filter((r) => r.status === "fulfilled").length;
  const ms = Date.now() - start;
  console.log(`[warmup] Listo: ${ok}/3 exitosos en ${ms}ms`);
}