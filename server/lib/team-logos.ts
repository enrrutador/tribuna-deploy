/**
 * Resolución de logos/escudos con fallback multi-fuente.
 * Prioridad: cache → override manual → flagcdn (selecciones) → ESPN CDN → placeholder SVG.
 */

// ─── Cache de logos resueltos ────────────────────────────────────────────────
const logoCache = new Map<string, string>();

// ─── Mapeo manual selecciones → código ISO (flagcdn) ─────────────────────────
const SELECCION_A_ISO: Record<string, string> = {
  "argentina": "ar", "brasil": "br", "uruguay": "uy", "chile": "cl",
  "colombia": "co", "ecuador": "ec", "perú": "pe", "peru": "pe",
  "paraguay": "py", "bolivia": "bo", "venezuela": "ve",
  "méxico": "mx", "mexico": "mx", "estados unidos": "us",
  "canadá": "ca", "canada": "ca", "costa rica": "cr",
  "francia": "fr", "españa": "es", "alemania": "de",
  "italia": "it", "inglaterra": "gb-eng", "portugal": "pt",
  "países bajos": "nl", "paises bajos": "nl", "bélgica": "be", "belgica": "be",
  "croacia": "hr", "suiza": "ch", "dinamarca": "dk",
  "noruega": "no", "suecia": "se", "polonia": "pl",
  "austria": "at", "turquía": "tr", "turquia": "tr",
  "marruecos": "ma", "senegal": "sn", "camerún": "cm", "camerun": "cm",
  "nigeria": "ng", "ghana": "gh", "egipto": "eg",
  "sudáfrica": "za", "sudafrica": "za", "túnez": "tn", "tunez": "tn",
  "costa de marfil": "ci", "rd congo": "cd",
  "japón": "jp", "japon": "jp", "corea del sur": "kr",
  "australia": "au", "arabia saudita": "sa", "irán": "ir", "iran": "ir",
  "irak": "iq", "qatar": "qa", "uzbekistán": "uz", "uzbekistan": "uz",
  "jordania": "jo", "nueva zelanda": "nz",
  "escocia": "gb-sct", "gales": "gb-wls",
};

// ─── Overrides manuales (TheSportsDB badges) ────────────────────────────────
const LOGOS_MANUALES: Record<string, string> = {
  "argentina": "https://r2.thesportsdb.com/images/media/team/badge/3zplhu1726167477.png",
  "francia": "https://r2.thesportsdb.com/images/media/team/badge/p3n0z51726166851.png",
  "brasil": "https://r2.thesportsdb.com/images/media/team/badge/jl6dip1726167280.png",
  "alemania": "https://r2.thesportsdb.com/images/media/team/badge/1xysi51726167152.png",
  "españa": "https://r2.thesportsdb.com/images/media/team/badge/ncgqyr1726166942.png",
  "inglaterra": "https://r2.thesportsdb.com/images/media/team/badge/vf5ttc1726166739.png",
  "portugal": "https://r2.thesportsdb.com/images/media/team/badge/swqvpy1455466083.png",
  "italia": "https://r2.thesportsdb.com/images/media/team/badge/fxijcp1726167035.png",
  "croacia": "https://r2.thesportsdb.com/images/media/team/badge/vvtsyu1455465317.png",
  "japón": "https://r2.thesportsdb.com/images/media/team/badge/ffsyxz1591989843.png",
  "irán": "https://r2.thesportsdb.com/images/media/team/badge/uttpvw1455465617.png",
  "senegal": "https://r2.thesportsdb.com/images/media/team/badge/slayb01780546342.png",
  "ghana": "https://r2.thesportsdb.com/images/media/team/badge/j589xw1751526124.png",
  "nigeria": "https://r2.thesportsdb.com/images/media/team/badge/qruyxr1455466056.png",
  "australia": "https://r2.thesportsdb.com/images/media/team/badge/eylq8x1781926138.png",
  "suecia": "https://r2.thesportsdb.com/images/media/team/badge/h5adzg1591981772.png",
  "noruega": "https://r2.thesportsdb.com/images/media/team/badge/gyfn811591973155.png",
  "austria": "https://r2.thesportsdb.com/images/media/team/badge/874p631628721400.png",
  "escocia": "https://r2.thesportsdb.com/images/media/team/badge/3691i11552945146.png",
  "gales": "https://r2.thesportsdb.com/images/media/team/badge/pdayn21591983222.png",
  "serbia": "https://r2.thesportsdb.com/images/media/team/badge/oxvynb1689195538.png",
  "méxico": "https://r2.thesportsdb.com/images/media/team/badge/3rmosi1748525208.png",
  "canadá": "https://r2.thesportsdb.com/images/media/team/badge/2t631f1595154867.png",
  "colombia": "https://r2.thesportsdb.com/images/media/team/badge/4ymyku1691180081.png",
  "uruguay": "https://r2.thesportsdb.com/images/media/team/badge/6vjbr11726167756.png",
  "chile": "https://r2.thesportsdb.com/images/media/team/badge/5xjsy41591988732.png",
  "ecuador": "https://r2.thesportsdb.com/images/media/team/badge/47wv2y1591989301.png",
  "paraguay": "https://r2.thesportsdb.com/images/media/team/badge/khgav41553419195.png",
  "perú": "https://r2.thesportsdb.com/images/media/team/badge/unszat1529144812.png",
  "panamá": "https://r2.thesportsdb.com/images/media/team/badge/asp2ck1715849700.png",
  "jamaica": "https://r2.thesportsdb.com/images/media/team/badge/v6mk4r1594321722.png",
  "túnez": "https://r2.thesportsdb.com/images/media/team/badge/7r89rg1526727277.png",
  "camerún": "https://r2.thesportsdb.com/images/media/team/badge/txqspw1455463989.png",
  "países bajos": "https://r2.thesportsdb.com/images/media/team/badge/1p0hr41593787110.png",
  "holanda": "https://r2.thesportsdb.com/images/media/team/badge/1p0hr41593787110.png",
  "bélgica": "https://r2.thesportsdb.com/images/media/team/badge/8xlvxv1592062265.png",
  "suiza": "https://r2.thesportsdb.com/images/media/team/badge/mb7yqe1717365808.png",
  "corea del sur": "https://r2.thesportsdb.com/images/media/team/badge/24xwpq1594125742.png",
  "estados unidos": "https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png",
  "egipto": "https://r2.thesportsdb.com/images/media/team/badge/eg.png",
  "arabia saudita": "https://r2.thesportsdb.com/images/media/team/badge/sa.png",
  "bosnia y herzegovina": "https://flagcdn.com/w80/ba.png",
  "hungría": "https://flagcdn.com/w80/hu.png",
  "dinamarca": "https://flagcdn.com/w80/dk.png",
  "argelia": "https://r2.thesportsdb.com/images/media/team/badge/dz.png",
  "cabo verde": "https://r2.thesportsdb.com/images/media/team/badge/cv.png",
  "jordania": "https://r2.thesportsdb.com/images/media/team/badge/jo.png",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function flagUrl(countryCode: string): string {
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
}

function generarPlaceholder(nombre: string, color: string): string {
  const stopwords = new Set(["de", "del", "la", "el", "los", "las", "fc", "ca", "club", "cd", "sc"]);
  const iniciales = nombre
    .split(" ")
    .filter((w) => w.length > 2 && !stopwords.has(w.toLowerCase()))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const bgColor = color && color !== "21282D" ? `#${color}` : "#3a4a5f";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
    <rect width="80" height="80" rx="16" fill="${bgColor}"/>
    <text x="40" y="52" text-anchor="middle" font-family="system-ui" font-size="28" font-weight="700" fill="white">${iniciales || "?"}</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function normalize(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// ─── Función principal ───────────────────────────────────────────────────────

export function resolverLogo(
  teamId: string,
  teamName: string,
  existingLogoUrl: string | undefined | null,
  teamColor: string,
  leagueId: string,
): string {
  // 1. Si ya tiene logo válido (no vacío, no undefined literal), usar
  if (existingLogoUrl && existingLogoUrl.length > 10 && !existingLogoUrl.includes("undefined")) {
    return existingLogoUrl;
  }

  // 2. Revisar cache
  const cacheKey = `${teamId}:${normalize(teamName)}`;
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey)!;
  }

  const nombreLower = normalize(teamName);

  // 3. Override manual (TheSportsDB badges / flagcdn)
  if (LOGOS_MANUALES[nombreLower]) {
    const url = LOGOS_MANUALES[nombreLower];
    logoCache.set(cacheKey, url);
    return url;
  }

  // 4. Selección nacional en liga mundial → bandera
  const iso = SELECCION_A_ISO[nombreLower];
  if (iso && (leagueId === "fifa.world" || leagueId.includes("fifa.worldq"))) {
    const url = flagUrl(iso);
    logoCache.set(cacheKey, url);
    return url;
  }

  // 5. ESPN CDN (para equipos con ID numérico ESPN)
  if (/^\d+$/.test(teamId)) {
    const url = `https://a.espncdn.com/i/teamlogos/soccer/500/${teamId}.png`;
    logoCache.set(cacheKey, url);
    return url;
  }

  // 6. Placeholder con iniciales y color del equipo
  const placeholder = generarPlaceholder(teamName, teamColor);
  logoCache.set(cacheKey, placeholder);
  return placeholder;
}

// ─── Keep getTeamLogoUrl as alias for backward compat ────────────────────────
export { resolverLogo as getTeamLogoUrl };

// ─── Búsqueda externa (TheSportsDB) bajo demanda ────────────────────────────
export async function buscarLogoExterno(teamName: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(teamName);
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encoded}`,
      { signal: AbortSignal.timeout(4000) },
    );
    const data = (await res.json()) as Record<string, unknown>;
    const teams = data?.teams as Array<Record<string, unknown>> | undefined;
    if (teams && teams[0]?.strBadge) {
      return String(teams[0].strBadge);
    }
    if (teams && teams[0]?.strLogo) {
      return String(teams[0].strLogo);
    }
    return null;
  } catch {
    return null;
  }
}
