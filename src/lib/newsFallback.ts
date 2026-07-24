/**
 * Fallback news data when the backend is not available.
 * Useful for development when the Express server is not running.
 */

import type { NewsItem } from "./types";

export const fallbackNews: NewsItem[] = [
  {
    id: "fallback-1",
    title: "Mundial 2026: Se definieron las sedes para la fase de grupos",
    description: "La FIFA confirmó los estadios que albergarán los partidos de la fase inicial del Mundial 2026.",
    summary: "La FIFA confirmó los estadios que albergarán los partidos de la fase inicial del Mundial 2026.",
    imageUrl: "https://a.espncdn.com/i/espn/espn_logos/70x35/espn_red.png",
    imageCredit: "ESPN",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    publishedAgo: "hace 2 h",
    source: "ESPN",
    url: "https://www.espn.com/soccer/",
    category: "mundial",
  },
  {
    id: "fallback-2",
    title: "Argentina se prepara para las Eliminatorias con novedades",
    description: "Scaloni definió la lista de convocados para los próximos partidos de la selección argentina.",
    summary: "Scaloni definió la lista de convocados para los próximos partidos de la selección argentina.",
    imageUrl: null,
    imageCredit: null,
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    publishedAgo: "hace 5 h",
    source: "ESPN",
    url: "https://www.espn.com.ar/futbol/",
    category: "argentina",
  },
  {
    id: "fallback-3",
    title: "Copa Libertadores: Boca y River en la mira de octavos",
    description: "Los equipos argentinos buscan avanzar en la competición más importante de Sudamérica.",
    summary: "Los equipos argentinos buscan avanzar en la competición más importante de Sudamérica.",
    imageUrl: null,
    imageCredit: null,
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    publishedAgo: "hace 1 d",
    source: "ESPN",
    url: "https://www.espn.com.ar/futbol/",
    category: "general",
  },
  {
    id: "fallback-4",
    title: "La Premier League define su campeón en una temporada apretada",
    description: "La lucha por el título en Inglaterra llega a su instancia final con varios equipos en carrera.",
    summary: "La lucha por el título en Inglaterra llega a su instancia final con varios equipos en carrera.",
    imageUrl: null,
    imageCredit: null,
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    publishedAgo: "hace 12 h",
    source: "ESPN",
    url: "https://www.espn.com/soccer/",
    category: "general",
  },
];
