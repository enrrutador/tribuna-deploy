/**
 * Ping periódico al propio health check para evitar que Render duerma el servicio.
 * Solo en producción.
 */
const INTERVAL_MS = 5 * 60 * 1000; // 5 minutos
const HEALTH_URL = process.env.RENDER_EXTERNAL_URL
  ? `${process.env.RENDER_EXTERNAL_URL}/api/health`
  : null;

export function startKeepAlive() {
  if (!HEALTH_URL) {
    console.log("[keepalive] No RENDER_EXTERNAL_URL, skipping");
    return;
  }
  console.log(`[keepalive] Pinging ${HEALTH_URL} every 5min`);
  setInterval(async () => {
    try {
      await fetch(HEALTH_URL, { signal: AbortSignal.timeout(5000) });
    } catch {
      // no-op, el punto es mantener el proceso vivo
    }
  }, INTERVAL_MS);
}