import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Lang = "es" | "en" | "pt" | "it" | "de" | "fr";

interface I18nContext {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const STORAGE_KEY = "tribuna-lang";

const translations: Record<Lang, Record<string, string>> = {
  es: {},
  en: {
    // Navigation
    "Inicio": "Home",
    "En Vivo": "Live",
    "Vivo": "Live",
    "Favoritos": "Favorites",
    "Torneos": "Tournaments",
    "Tendencias": "Trending",
    "Fútbol en vivo": "Live football",
    "Ver torneos": "View tournaments",

    // Header
    "EN VIVO": "LIVE",
    "Buscar equipo, torneo o jugador": "Search team, tournament or player",
    "Limpiar": "Clear",

    // Sidebar
    "Ligas y Torneos": "Leagues & Tournaments",

    // Tournament categories
    "Destacados": "Featured",
    "Argentina": "Argentina",
    "Sudamérica": "South America",
    "Mundo": "World",
    "Todas las ligas": "All leagues",

    // Match status
    "EN VIVO": "LIVE",
    "Finalizado": "Finished",
    "Próximo": "Upcoming",
    "hoy": "today",
    "ayer": "yesterday",

    // General UI
    "Cargando": "Loading",
    "Error": "Error",
    "Error interno": "Internal error",
    "Intentar de nuevo": "Try again",
    "Recargar": "Reload",
    "Actualizar": "Refresh",
    "Volver": "Back",
    "Ver más": "View more",
    "Ver todo": "View all",
    "No se encontraron resultados": "No results found",
    "No se encontraron tendencias en este momento": "No trends found at the moment",

    // Time
    "recién": "just now",
    "hace 1 min": "1 min ago",
    "h": "h",
    "min": "min",
    "d": "d",

    // Page titles
    "Resultados en Vivo, Fixture y Tabla de Posiciones": "Live Scores, Fixtures & Standings",
    "Fútbol Argentino y Mundial": "Argentine & World Football",
    "Lo más buscado sobre fútbol en Argentina y el mundo": "Most searched football topics in Argentina and the world",

    // Favorites
    "Mis favoritos": "My favorites",
    "Agrega equipos o torneos a favoritos": "Add teams or tournaments to favorites",
    "Tus equipos": "Your teams",
    "Tus torneos": "Your tournaments",

    // Footer
    "Todos los derechos reservados": "All rights reserved",
    "Mapa del sitio": "Sitemap",

    // Buttons
    "Cerrar": "Close",
    "Guardar": "Save",
    "Cancelar": "Cancel",
    "Eliminar": "Delete",
    "Editar": "Edit",
    "Compartir": "Share",
  },
  pt: {
    "Inicio": "Início",
    "En Vivo": "Ao Vivo",
    "Vivo": "Ao Vivo",
    "Favoritos": "Favoritos",
    "Torneios": "Torneios",
    "Tendencias": "Tendências",
    "Fútbol en vivo": "Futebol ao vivo",
    "Ver torneos": "Ver torneios",
    "EN VIVO": "AO VIVO",
    "Buscar equipo, torneo o jugador": "Buscar time, torneio ou jogador",
    "Limpiar": "Limpar",
    "Ligas y Torneos": "Ligas e Torneios",
    "Destacados": "Destaques",
    "Argentina": "Argentina",
    "Sudamérica": "América do Sul",
    "Mundo": "Mundo",
    "Todas las ligas": "Todas as ligas",
    "Finalizado": "Finalizado",
    "Próximo": "Próximo",
    "hoy": "hoje",
    "ayer": "ontem",
    "Cargando": "Carregando",
    "Error": "Erro",
    "Error interno": "Erro interno",
    "Intentar de nuevo": "Tentar novamente",
    "Recargar": "Recarregar",
    "Actualizar": "Atualizar",
    "Volver": "Voltar",
    "Ver más": "Ver mais",
    "Ver todo": "Ver tudo",
    "No se encontraron resultados": "Nenhum resultado encontrado",
    "No se encontraron tendencias en este momento": "Nenhuma tendência encontrada no momento",
    "recién": "agora",
    "h": "h",
    "d": "d",
    "Mis favoritos": "Meus favoritos",
    "Agrega equipos o torneos a favoritos": "Adicione times ou torneios aos favoritos",
    "Tus equipos": "Seus times",
    "Tus torneios": "Seus torneios",
    "Todos los derechos reservados": "Todos os direitos reservados",
    "Mapa del sitio": "Mapa do site",
    "Cerrar": "Fechar",
    "Compartilhar": "Compartilhar",
  },
  it: {
    "Inicio": "Home",
    "En Vivo": "In Diretta",
    "Vivo": "Diretta",
    "Favoritos": "Preferiti",
    "Torneos": "Tornei",
    "Tendencias": "Tendenze",
    "Fútbol en vivo": "Calcio in diretta",
    "Ver torneos": "Vedi tornei",
    "EN VIVO": "DIRETTA",
    "Buscar equipo, torneo o jugador": "Cerca squadra, torneo o giocatore",
    "Limpiar": "Pulisci",
    "Destacados": "In Evidenza",
    "Argentina": "Argentina",
    "Sudamérica": "Sud America",
    "Mondo": "Mondo",
    "Finalizado": "Finito",
    "Próximo": "Prossimo",
    "Cargando": "Caricamento",
    "Error": "Errore",
    "Intentar de nuevo": "Riprova",
    "Recargar": "Ricarica",
    "Actualizar": "Aggiorna",
    "Mis favoritos": "I miei preferiti",
  },
  de: {
    "Inicio": "Start",
    "En Vivo": "Live",
    "Vivo": "Live",
    "Favoritos": "Favoriten",
    "Torneos": "Turniere",
    "Tendencias": "Trends",
    "Fútbol en vivo": "Fußball live",
    "EN VIVO": "LIVE",
    "Destacados": "Hervorgehoben",
    "Argentina": "Argentinien",
    "Sudamérica": "Südamerika",
    "Mundo": "Welt",
    "Finalizado": "Beendet",
    "Próximo": "Nächstes",
    "Cargando": "Laden",
    "Error": "Fehler",
    "Intentar de nuevo": "Erneut versuchen",
    "Recargar": "Neu laden",
    "Actualizar": "Aktualisieren",
    "Mis favoritos": "Meine Favoriten",
  },
  fr: {
    "Inicio": "Accueil",
    "En Vivo": "En Direct",
    "Vivo": "Direct",
    "Favoritos": "Favoris",
    "Torneos": "Tournois",
    "Tendencias": "Tendances",
    "Fútbol en vivo": "Football en direct",
    "EN VIVO": "EN DIRECT",
    "Destacados": "À la Une",
    "Argentina": "Argentine",
    "Sudamérica": "Amérique du Sud",
    "Mundo": "Monde",
    "Finalizado": "Terminé",
    "Próximo": "Prochain",
    "Cargando": "Chargement",
    "Error": "Erreur",
    "Intentar de nuevo": "Réessayer",
    "Recargar": "Recharger",
    "Actualizar": "Actualiser",
    "Mis favoritos": "Mes favoris",
  },
};

function loadLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in translations) return stored as Lang;
  } catch {}
  return "es";
}

const I18nCtx = createContext<I18nContext>({
  lang: "es",
  setLang: () => {},
  t: (k: string) => k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  const t = useCallback(
    (key: string) => translations[lang]?.[key] ?? key,
    [lang]
  );

  return (
    <I18nCtx.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nCtx);
}

export const LANG_FLAGS: Record<Lang, string> = {
  es: "🇪🇸",
  en: "🇬🇧",
  pt: "🇧🇷",
  it: "🇮🇹",
  de: "🇩🇪",
  fr: "🇫🇷",
};

export const LANG_NAMES: Record<Lang, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
  it: "Italiano",
  de: "Deutsch",
  fr: "Français",
};

export const LANGUAGES: Lang[] = ["es", "en", "pt", "it", "de", "fr"];
