import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes intelligently. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an ISO date to Argentine time with relative day label. */
export function formatKickoff(iso: string): string {
  try {
    const d = new Date(iso);
    const hora = d.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Buenos_Aires",
    });

    const now = new Date();
    const todayStr = now.toLocaleDateString("es-CA", { timeZone: "America/Buenos_Aires" });
    const matchStr = d.toLocaleDateString("es-CA", { timeZone: "America/Buenos_Aires" });

    const today = new Date(todayStr);
    const match = new Date(matchStr);
    const diffMs = match.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / 86400000);

    if (diffDays === 0) return `Hoy ${hora}`;
    if (diffDays === 1) return `Mañana ${hora}`;
    if (diffDays === -1) return `Ayer ${hora}`;
    if (diffDays > 1 && diffDays < 7) {
      const dia = d.toLocaleDateString("es-AR", { weekday: "short", timeZone: "America/Buenos_Aires" });
      return `${dia} ${hora}`;
    }
    const fecha = d.toLocaleDateString("es-AR", { day: "numeric", month: "short", timeZone: "America/Buenos_Aires" });
    return `${fecha} ${hora}`;
  } catch {
    return "--:--";
  }
}

/** Format ISO date to "Lun 5 May" style in Spanish. */
export function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso);
    const art = new Date(d.getTime() - 3 * 60 * 60 * 1000);
    return art.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });
  } catch {
    return "";
  }
}

/** Today's date in ART (YYYY-MM-DD). */
export function argToday(): string {
  const ms = Date.now() - 3 * 60 * 60 * 1000;
  return new Date(ms).toISOString().split("T")[0]!;
}

/** Relative "hace X" / "en X" for timestamps. */
export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "recién";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

/** Extract minute number from a minute string like "45' +2" or "73'". */
export function parseMinute(minute: string | null): number {
  if (!minute) return 0;
  const m = minute.match(/(\d+)/);
  return m ? parseInt(m[1]!) : 0;
}

/** Clamp a number between min and max. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

/** Format large numbers: 1500 → "1.5K", 1200000 → "1.2M". */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
