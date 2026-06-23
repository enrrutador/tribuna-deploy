import * as cheerio from "cheerio";
import { logger } from "./logger";
import { execFile } from "child_process";
import { promisify } from "util";
import { tmpdir } from "os";
import { join } from "path";

const execFileAsync = promisify(execFile);

const TM_BASE = "https://www.transfermarkt.com";

type CacheEntry<T> = { data: T; expiresAt: number };
const tmCache = new Map<string, CacheEntry<unknown>>();

function getTmCache<T>(key: string): T | undefined {
  const entry = tmCache.get(key) as CacheEntry<T> | undefined;
  if (!entry || Date.now() > entry.expiresAt) return undefined;
  return entry.data;
}

function setTmCache<T>(key: string, data: T, ttlMs: number) {
  tmCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

const TM_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
};

const TM_COOKIE_FILE = join(tmpdir(), "tm-cookies-persistent.txt");

async function tmFetch(url: string): Promise<string> {
  try {
    const args = [
      "-s", "-L",
      "-c", TM_COOKIE_FILE,
      "-b", TM_COOKIE_FILE,
      "-H", `User-Agent: ${TM_HEADERS["User-Agent"]}`,
      "-H", `Accept: ${TM_HEADERS["Accept"]}`,
      "-H", `Accept-Language: ${TM_HEADERS["Accept-Language"]}`,
      "-H", "Cookie: cookie=1; gdpr=1; euconsent=1",
      "--max-time", "15",
      url,
    ];
    const { stdout } = await execFileAsync("curl", args, { timeout: 20_000, maxBuffer: 10 * 1024 * 1024 });
    return stdout;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Transfermarkt fetch failed: ${msg} ${url}`);
  }
}

export type TmSquadPlayer = {
  id: string;
  name: string;
  slug: string;
  position: string;
  age: number | null;
  nationality: string;
  marketValue: string;
  marketValueNum: number | null;
  imageUrl: string | null;
  shirtNumber: number | null;
  joinedFrom: string | null;
  contractUntil: string | null;
};

export type TmTransfer = {
  id: string;
  playerName: string;
  playerSlug: string;
  playerImageUrl: string | null;
  fromTeam: string;
  fromTeamId: string | null;
  toTeam: string;
  toTeamId: string | null;
  fee: string;
  feeNum: number | null;
  transferType: string;
  date: string;
  season: string;
  position: string;
  nationality: string;
};

export type TmTeamInfo = {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  marketValue: string | null;
  squadSize: number | null;
  averageAge: number | null;
  foreigners: number | null;
  nationalPlayers: number | null;
  stadium: string | null;
  capacity: number | null;
  founded: number | null;
  coach: string | null;
  imageUrl: string | null;
};

function parseMarketValue(valueStr: string): number | null {
  if (!valueStr || valueStr === "-" || valueStr === "N/A") return null;
  const cleaned = valueStr.replace(/[^0-9.,km]/gi, "").toLowerCase();
  if (cleaned.includes("m")) {
    return parseFloat(cleaned.replace("m", "").replace(",", ".")) * 1_000_000;
  }
  if (cleaned.includes("k")) {
    return parseFloat(cleaned.replace("k", "").replace(",", ".")) * 1_000;
  }
  const num = parseFloat(cleaned.replace(",", ""));
  return isNaN(num) ? null : num;
}

function positionMap(tmPos: string): string {
  const lower = tmPos.toLowerCase().trim();
  if (lower.includes("goalkeeper") || lower === "gk") return "GK";
  if (lower.includes("centre-back") || lower.includes("center-back") || lower.includes("defender") || lower.includes("back") || lower === "d" || lower === "cb" || lower === "lb" || lower === "rb" || lower === "lwb" || lower === "rwb") return "DEF";
  if (lower.includes("midfield") || lower.includes("midfielder") || lower === "m" || lower === "cm" || lower === "dm" || lower === "am" || lower === "cdm" || lower === "cam") return "MID";
  if (lower.includes("forward") || lower.includes("striker") || lower.includes("winger") || lower === "f" || lower === "cf" || lower === "lw" || lower === "rw" || lower === "ss") return "FWD";
  return "MID";
}

export const TM_TEAM_SLUGS: Record<string, string> = {
  // Argentina
  "5": "boca-juniors/startseite/verein/189",
  "16": "river-plate/startseite/verein/209",
  "15": "racing-club/startseite/verein/1444",
  "18": "club-atletico-san-lorenzo-de-almagro/startseite/verein/1775",
  "11": "club-atletico-independiente/startseite/verein/1234",
  "21": "velez-sarsfield/startseite/verein/1029",
  "8": "estudiantes-de-la-plata/startseite/verein/288",
  "12": "club-atletico-lanus/startseite/verein/333",
  "8950": "defensa-y-justicia/startseite/verein/2402",
  "19": "talleres-cordoba/startseite/verein/3938",
  "4": "belgrano-cordoba/startseite/verein/127879",
  "20": "union-santa-fe/startseite/verein/7097",
  "3": "argentinos-juniors/startseite/verein/1030",
  "9": "gimnasia-la-plata/startseite/verein/1106",
  "10": "club-atletico-huracan/startseite/verein/2063",
  // Brazil
  "819": "flamengo/startseite/verein/84287",
  "2029": "palmeiras/startseite/verein/1023",
  "7632": "atletico-mineiro/startseite/verein/330",
  "2026": "sao-paulo-fc/startseite/verein/585",
  "1936": "sc-internacional/startseite/verein/6600",
  // Spain
  "83": "fc-barcelona/startseite/verein/131",
  "86": "real-madrid/startseite/verein/418",
  "1068": "club-atletico-de-madrid/startseite/verein/13",
  "93": "athletic-club/startseite/verein/150",
  "243": "fc-sevilla/startseite/verein/368",
  // England
  "382": "manchester-city/startseite/verein/281",
  "364": "liverpool-fc/startseite/verein/31",
  "360": "manchester-united/startseite/verein/985",
  "363": "chelsea-fc/startseite/verein/631",
  "359": "arsenal-fc/startseite/verein/11",
  "367": "tottenham-hotspur/startseite/verein/148",
  // Germany
  "132": "fc-bayern-munich/startseite/verein/27",
  "124": "borussia-dortmund/startseite/verein/16",
  // Italy
  "111": "juventus-fc/startseite/verein/506",
  "103": "ac-mailand/startseite/verein/5",
  "110": "inter-mailand/startseite/verein/46",
  // France
  "160": "paris-saint-germain/startseite/verein/583",
  "167": "olympique-lyon/startseite/verein/1041",
  "176": "olympique-marseille/startseite/verein/244",
  // USA/MLS
  "69261": "inter-miami-cf/startseite/verein/69261",
  "69486": "la-galaxy/startseite/verein/69486",
  // Portugal
  "1929": "sl-benfica/startseite/verein/294",
  "437": "fc-porto/startseite/verein/378",
  "2250": "sporting-cp/startseite/verein/336",
  // Netherlands
  "139": "ajax-amsterdam/startseite/verein/401",
  "148": "psv-eindhoven/startseite/verein/483",
  // Turkey
  "432": "galatasaray-istanbul/startseite/verein/320",
  "436": "fenerbahce-istanbul/startseite/verein/36",
};

function espnTeamIdToTmTeamId(espnId: string): string | null {
  const slug = TM_TEAM_SLUGS[espnId];
  if (!slug) return null;
  const m = slug.match(/verein\/(\d+)/);
  return m?.[1] ?? null;
}

function espnTeamIdToName(espnId: string): string {
  const slug = TM_TEAM_SLUGS[espnId];
  if (!slug) return "Unknown";
  return slug.split("/")[0]!.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function fetchTeamSquadTM(teamId: string, season?: string): Promise<TmSquadPlayer[]> {
  const s = season ?? "2025";
  const cacheKey = `tm-squad:${teamId}:${s}`;
  const cached = getTmCache<TmSquadPlayer[]>(cacheKey);
  if (cached) return cached;

  try {
    const slug = TM_TEAM_SLUGS[teamId];
    let url: string;
    if (!slug) {
      url = `${TM_BASE}/club/startseite/verein/${teamId}/saison/${s}`;
    } else {
      url = `${TM_BASE}/${slug}/saison/${s}`;
    }
    const html = await tmFetch(url);
    const players = parseSquadPage(html, teamId);
    if (players.length > 0) {
      setTmCache(cacheKey, players, 30 * 60_000);
      return players;
    }

    // Retry with alternative URL for generic case
    if (!slug) {
      const altUrl = `${TM_BASE}/club/startseite/verein/${teamId}`;
      const altHtml = await tmFetch(altUrl);
      const altPlayers = parseSquadPage(altHtml, teamId);
      if (altPlayers.length > 0) {
        setTmCache(cacheKey, altPlayers, 30 * 60_000);
        return altPlayers;
      }
    }

    return [];
  } catch (err) {
    logger.error({ err, teamId }, "Transfermarkt squad fetch failed");
    return [];
  }
}

function parseSquadPage(html: string, teamId: string): TmSquadPlayer[] {
  const $ = cheerio.load(html);
  const players: TmSquadPlayer[] = [];

  $("table.items > tbody > tr").each((_idx, row) => {
    try {
      const nameEl = $(row).find(".hauptlink a").first();
      const name = nameEl.text().trim();
      if (!name) return;

      const href = nameEl.attr("href") ?? "";
      const playerIdMatch = href.match(/\/spieler\/(\d+)/);
      const playerId = playerIdMatch?.[1] ?? `${teamId}-${_idx}`;
      const playerSlug = href.split("/").filter(Boolean).pop() ?? name.toLowerCase().replace(/\s+/g, "-");

      const imgEl = $(row).find("img").first();
      const imageUrl = imgEl.attr("src")?.replace("small", "medium") ?? null;

      const posCell = $(row).find("td.posrela").first();
      const posText = posCell.find("tr:nth-child(2) td").text().trim() || posCell.text().trim();

      const cells = $(row).find("td");
      const ageCell = cells.filter((_i, el) => $(el).hasClass("zentriert"));
      const ageText = ageCell.eq(1).text().trim();
      const age = ageText ? parseInt(ageText) : null;

      const flagEl = $(row).find("img.flaggenrahmen").first();
      const nationality = flagEl.attr("title") ?? flagEl.attr("alt") ?? "";

      const valueEl = $(row).find(".rechts.hauptlink").first();
      const marketValue = valueEl.text().trim();
      const marketValueNum = parseMarketValue(marketValue);

      const shirtEl = $(row).find(".rn_nummberr").first();
      const shirtNumber = shirtEl.text().trim() ? parseInt(shirtEl.text().trim()) : null;

      players.push({
        id: playerId,
        name,
        slug: playerSlug,
        position: positionMap(posText),
        age,
        nationality,
        marketValue,
        marketValueNum,
        imageUrl,
        shirtNumber,
        joinedFrom: null,
        contractUntil: null,
      });
    } catch {
      // skip malformed row
    }
  });

  return players;
}

export async function fetchTeamInfoTM(teamId: string, season?: string): Promise<TmTeamInfo | null> {
  const s = season ?? "2025";
  const cacheKey = `tm-team:${teamId}:${s}`;
  const cached = getTmCache<TmTeamInfo | null>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const slug = TM_TEAM_SLUGS[teamId];
    const url = slug ? `${TM_BASE}/${slug}/saison/${s}` : `${TM_BASE}/club/startseite/verein/${teamId}`;

    const html = await tmFetch(url);
    const $ = cheerio.load(html);

    const name = $(".data-header__headline-wrapper").text().trim() || $("h1").first().text().trim();
    
    const metaKeywords = $("meta[name='keywords']").attr("content") ?? "";
    const countryFromMeta = metaKeywords.split(",").pop()?.trim() ?? null;
    const countryFromFlag = $(".data-header__box--big img.flaggenrahmen").attr("title") ?? null;
    const country = countryFromFlag || countryFromMeta;

    const marketValue = $(".data-header__market-value-wrapper").first().text().replace(/\s+/g, " ").trim() || null;
    
    const coach = $("li").filter(function() {
      return $(this).text().includes("Coach:");
    }).find("a").first().text().trim() || null;
    
    const stadiumItem = $("li").filter(function() {
      return $(this).text().includes("Stadium:");
    });
    const stadium = stadiumItem.find(".data-header__content a").first().text().trim() || null;
    const capacityMatch = stadiumItem.find(".data-header__content").text().match(/([\d.,]+)\s*Seats?/i);
    const capacity = capacityMatch ? parseInt(capacityMatch[1]!.replace(/[.,]/g, "")) : null;

    const foundedItem = $("li").filter(function() {
      return $(this).text().includes("Founded:");
    });
    const foundedText = foundedItem.find(".data-header__content").text().trim();
    const founded = foundedText ? parseInt(foundedText) || null : null;

    const squadSizeStr = $("li").filter(function() {
      return $(this).text().includes("Squad size:");
    }).find(".data-header__content").text().trim();
    
    const avgAgeStr = $("li").filter(function() {
      return $(this).text().includes("Average age:");
    }).find(".data-header__content").text().trim();
    
    const foreignersStr = $("li").filter(function() {
      return $(this).text().includes("Foreigners:");
    }).find(".data-header__content a").first().text().trim();

    const imageUrl = $(".data-header__box--big img").first().attr("data-src") ?? $(".data-header__box--big img").first().attr("src") ?? null;

    const result: TmTeamInfo = {
      id: teamId,
      name: name || `Team ${teamId}`,
      slug: slug ?? `verein-${teamId}`,
      country,
      marketValue,
      squadSize: squadSizeStr ? parseInt(squadSizeStr) : null,
      averageAge: avgAgeStr ? parseFloat(avgAgeStr) : null,
      foreigners: foreignersStr ? parseInt(foreignersStr) : null,
      nationalPlayers: null,
      stadium,
      capacity,
      founded,
      coach,
      imageUrl,
    };

    setTmCache(cacheKey, result, 30 * 60_000);
    return result;
  } catch (err) {
    logger.error({ err, teamId }, "Transfermarkt team info fetch failed");
    setTmCache(cacheKey, null, 60_000);
    return null;
  }
}

export async function fetchTransfers(league: string = "argentina", season: string = "2025"): Promise<TmTransfer[]> {
  const cacheKey = `tm-transfers:${league}:${season}`;
  const cached = getTmCache<TmTransfer[]>(cacheKey);
  if (cached) return cached;

  const leagueTeams: Record<string, string[]> = {
    "argentina": ["5", "16", "15", "18", "11", "21", "8", "12", "8950", "19", "4", "20", "3", "9", "10"],
    "arg.1": ["5", "16", "15", "18", "11", "21", "8", "12", "8950", "19", "4", "20", "3", "9", "10"],
    "bra.1": ["819", "2029", "7632", "2026", "1936"],
    "brazil": ["819", "2029", "7632", "2026", "1936"],
    "eng.1": ["382", "364", "360", "363", "359", "367"],
    "premier-league": ["382", "364", "360", "363", "359", "367"],
    "esp.1": ["83", "86", "1068", "93", "243"],
    "la-liga": ["83", "86", "1068", "93", "243"],
    "ita.1": ["111", "103", "110"],
    "serie-a": ["111", "103", "110"],
    "ger.1": ["132", "124"],
    "bundesliga": ["132", "124"],
    "fra.1": ["160", "167", "176"],
    "ligue-1": ["160", "167", "176"],
    "usa.1": ["69261", "69486"],
    "mls": ["69261", "69486"],
    "por.1": ["1929", "437", "2250"],
    "primeira-liga": ["1929", "437", "2250"],
    "ned.1": ["139", "148"],
    "eredivisie": ["139", "148"],
    "tur.1": ["432", "436"],
    "super-lig": ["432", "436"],
  };

  const teamIds = league === "all"
    ? [...new Set(Object.values(leagueTeams).flat())]
    : leagueTeams[league];
  if (!teamIds?.length) {
    setTmCache(cacheKey, [], 5 * 60_000);
    return [];
  }

  const transfers: TmTransfer[] = [];
  const seen = new Set<string>();

  const posClassMap: Record<string, string> = {
    "bg_Torwart": "GK",
    "bg_Abwehr": "DEF",
    "bg_Mittelfeld": "MID",
    "bg_Sturm": "FWD",
  };

  for (const teamId of teamIds.slice(0, 6)) {
    try {
      const slug = TM_TEAM_SLUGS[teamId];
      const url = slug
        ? `${TM_BASE}/${slug.replace("/startseite/", "/transfers/")}/saison/${season}`
        : `${TM_BASE}/club/transfers/verein/${teamId}/saison/${season}`;

      const html = await tmFetch(url);
      const $ = cheerio.load(html);

      $("table.items").each((_tIdx, table) => {
        const heading = $(table).closest(".box").find("h2").text().trim();
        const isArrivals = /arrivals|zugänge/i.test(heading);
        const isDepartures = /departures|abgänge/i.test(heading);

        $(table).find("> tbody > tr").each((_idx, row) => {
          try {
            const nameEl = $(row).find(".hauptlink a").first();
            const playerName = nameEl.attr("title") || nameEl.text().trim();
            if (!playerName) return;

            const key = `${playerName}-${teamId}-${isArrivals ? "in" : "out"}`;
            if (seen.has(key)) return;
            seen.add(key);

            const href = nameEl.attr("href") ?? "";
            const playerSlug = href.replace(/^\//, "").replace(/\/profil\/spieler\/.*$/, "") || "";
            const playerIdMatch = href.match(/\/spieler\/(\d+)/);
            const pid = playerIdMatch?.[1] ?? `transfer-${teamId}-${_idx}`;

            const imgEl = $(row).find("img.bilderrahmen-fixed").first();
            const imgSrc = imgEl.attr("data-src") || imgEl.attr("src") || "";
            const playerImageUrl = imgSrc.includes("data:image") ? null : imgSrc.replace("/medium/", "/medium/") || null;

            const posClass = $(row).find("td[class^='bg_']").first().attr("class") ?? "";
            const posText = posClassMap[posClass] ?? "MID";

            const flagEl = $(row).find("img.flaggenrahmen").first();
            const nationality = flagEl.attr("title") ?? "";

            const teamLinks = $(row).find('a[href*="/verein/"]');
            const otherTeamEl = teamLinks.first();
            const otherTeam = otherTeamEl.attr("title") || otherTeamEl.text().trim() || "Unknown";
            const otherTeamIdMatch = otherTeamEl.attr("href")?.match(/verein\/(\d+)/);

            const feeEl = $(row).find("td.rechts.hauptlink");
            const fee = feeEl.text().trim() || "Free";

            const fromTeam = isArrivals ? otherTeam : espnTeamIdToName(teamId);
            const fromTeamId = isArrivals ? (otherTeamIdMatch?.[1] ?? null) : espnTeamIdToTmTeamId(teamId);
            const toTeam = isDepartures ? otherTeam : espnTeamIdToName(teamId);
            const toTeamId = isDepartures ? (otherTeamIdMatch?.[1] ?? null) : espnTeamIdToTmTeamId(teamId);

            transfers.push({
              id: pid,
              playerName,
              playerSlug,
              playerImageUrl,
              fromTeam,
              fromTeamId: String(fromTeamId),
              toTeam,
              toTeamId: String(toTeamId),
              fee,
              feeNum: parseMarketValue(fee),
              transferType: fee.toLowerCase().includes("loan") ? "loan" : (fee.toLowerCase().includes("free") || fee === "-" ? "free" : "transfer"),
              date: "",
              season,
              position: posText,
              nationality,
            });
          } catch {
            // skip
          }
        });
      });
    } catch (err) {
      logger.error({ err, teamId, league }, "Transfermarkt team transfers fetch failed");
    }
  }

  setTmCache(cacheKey, transfers, 60 * 60_000);
  return transfers;
}

export async function fetchPlayerTransfersTM(playerSlug: string, playerId?: number): Promise<TmTransfer[]> {
  const cacheKey = `tm-player-transfers:${playerId ?? playerSlug}`;
  const cached = getTmCache<TmTransfer[]>(cacheKey);
  if (cached) return cached;

  // Strategy 1: Try the dedicated player transfer page with slug-based URL
  try {
    const urlsToTry = [];
    if (playerId) {
      urlsToTry.push(`${TM_BASE}/-/transfers/spieler/${playerId}`);
      urlsToTry.push(`${TM_BASE}/${playerSlug}/transfers/spieler/${playerId}`);
    }
    urlsToTry.push(`${TM_BASE}/${playerSlug}/transfers/spieler`);

    for (const url of urlsToTry) {
      try {
        const html = await tmFetch(url);
        if (html.includes("table.items") || html.includes("transferhistorie") || html.includes("wechsel")) {
          const $ = cheerio.load(html);
          const transfers: TmTransfer[] = [];
          $("table.items > tbody > tr").each((_idx, row) => {
            try {
              const fromEl = $(row).find('td a[href*="verein/"]').first();
              const toEl = $(row).find('td a[href*="verein/"]').last();
              const feeEl = $(row).find(".rechts.hauptlink").last();
              const dateEl = $(row).find(".zentriert").eq(1);
              const seasonEl = $(row).find(".zentriert").eq(0);
              const fee = feeEl.text().trim() || "Free";
              transfers.push({
                id: `pt-${_idx}`,
                playerName: "",
                playerSlug,
                playerImageUrl: null,
                fromTeam: fromEl.text().trim() || "Unknown",
                fromTeamId: fromEl.attr("href")?.match(/verein\/(\d+)/)?.[1] ?? null,
                toTeam: toEl.text().trim() || "Unknown",
                toTeamId: toEl.attr("href")?.match(/verein\/(\d+)/)?.[1] ?? null,
                fee,
                feeNum: parseMarketValue(fee),
                transferType: fee.toLowerCase().includes("loan") ? "loan" : (fee.toLowerCase().includes("free") ? "free" : "transfer"),
                date: dateEl.text().trim(),
                season: seasonEl.text().trim(),
                position: "",
                nationality: "",
              });
            } catch { /* skip */ }
          });
          if (transfers.length > 0) {
            setTmCache(cacheKey, transfers, 60 * 60_000);
            return transfers;
          }
        }
      } catch { /* try next URL */ }
    }
  } catch { /* all URLs failed */ }

  // Strategy 2: Search team-level transfers for this player across all leagues
  try {
    if (playerId) {
      const profile = await fetchPlayerProfileTM(playerId);
      if (profile?.name) {
        const playerName = profile.name;
        const leagues = ["argentina", "eng.1", "esp.1", "bra.1", "ger.1", "ita.1", "fra.1", "usa.1", "por.1", "ned.1", "tur.1"];
        const allTransferPromises = leagues.map((l) =>
          fetchTransfers(l, "2025").catch(() => [] as TmTransfer[])
        );
        const allTransferResults = await Promise.all(allTransferPromises);
        const allTransfers = allTransferResults.flat();
        const matching = allTransfers.filter(
          (t) => t.playerName.toLowerCase() === playerName.toLowerCase()
        );
        if (matching.length > 0) {
          setTmCache(cacheKey, matching, 60 * 60_000);
          return matching;
        }
      }
    }
  } catch { /* lookup failed */ }

  setTmCache(cacheKey, [], 10 * 60_000);
  return [];
}

export async function searchPlayersTM(query: string): Promise<Array<{
  id: number;
  name: string;
  slug: string;
  position: string;
  nationality?: string;
  imageUrl?: string | null;
  team?: { id: number; name: string };
  marketValue?: number | null;
}>> {
  const cacheKey = `tm-search:${query.toLowerCase()}`;
  const cached = getTmCache<ReturnType<typeof searchPlayersTM>>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${TM_BASE}/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(query)}&x=0&y=0`;
    const html = await tmFetch(url);
    const $ = cheerio.load(html);
    const players: Array<{
      id: number;
      name: string;
      slug: string;
      position: string;
      nationality?: string;
      imageUrl?: string | null;
      team?: { id: number; name: string };
      marketValue?: number | null;
    }> = [];

    const seenIds = new Set<number>();
    $('table.items > tbody > tr, table > tbody > tr[class]').slice(0, 20).each((_idx, row) => {
      try {
        const nameEl = $(row).find(".hauptlink a[href*='/spieler/']").first();
        const name = nameEl.attr("title") || nameEl.text().trim();
        if (!name) return;

        const href = nameEl.attr("href") ?? "";
        const playerIdMatch = href.match(/\/spieler\/(\d+)/);
        if (!playerIdMatch) return;
        const playerId = parseInt(playerIdMatch[1]!);
        if (seenIds.has(playerId)) return;
        seenIds.add(playerId);

        const slug = href.replace(/^\//, "").replace(/\/profil\/spieler\/.*$/, "").split("/").filter(Boolean).pop() ?? name.toLowerCase().replace(/\s+/g, "-");

        const imgEl = $(row).find("img.bilderrahmen-fixed").first();
        const imageUrl = imgEl.attr("src")?.replace("/small/", "/medium/") ?? null;

        const zentriertTds = $(row).find("td.zentriert");
        const posText = zentriertTds.first().text().trim();

        const flagEl = $(row).find("img.flaggenrahmen").first();
        const nationality = flagEl.attr("title") ?? undefined;

        const teamEl = $(row).find('a[href*="verein/"]').not('a[href*="/startseite/"]').length
          ? $(row).find('a[href*="/startseite/verein/"]').first()
          : $(row).find('a[href*="verein/"]').first();
        const teamName = teamEl.attr("title") || teamEl.text().trim();
        const teamIdMatch = teamEl.attr("href")?.match(/verein\/(\d+)/);

        const valueEl = $(row).find("td.rechts.hauptlink").first();
        const marketValueStr = valueEl.text().trim();

        players.push({
          id: playerId,
          name,
          slug,
          position: positionMap(posText),
          nationality,
          imageUrl,
          team: teamName && teamName !== "---" ? { id: teamIdMatch ? parseInt(teamIdMatch[1]!) : 0, name: teamName } : undefined,
          marketValue: marketValueStr && marketValueStr !== "-" ? parseMarketValue(marketValueStr) : null,
        });
      } catch {
        // skip
      }
    });

  setTmCache(cacheKey, players, 10 * 60_000);
  return players;
  } catch (err) {
    logger.error({ err, query }, "Transfermarkt player search failed");
    return [];
  }
}

export async function fetchPlayerProfileTM(playerId: number): Promise<{
  id: number;
  name: string;
  slug: string;
  position: string;
  dateOfBirth: string | null;
  age: number | null;
  nationality: string | null;
  height: number | null;
  foot: string | null;
  imageUrl: string | null;
  team: { id: number; name: string; slug: string } | null;
  marketValue: number | null;
  contractExpires: string | null;
} | null> {
  const cacheKey = `tm-player:${playerId}`;
  const cached = getTmCache<ReturnType<typeof fetchPlayerProfileTM>>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const url = `${TM_BASE}/-/profil/spieler/${playerId}`;
    const html = await tmFetch(url);
    const $ = cheerio.load(html);

    const metaDesc = $('meta[name="description"]').attr("content") ?? "";
    const headlineEl = $(".data-header__headline-wrapper").first();
    headlineEl.find(".data-header__shirt-number").remove();
    const name = headlineEl.text().trim() || metaDesc.split(",")[0]?.trim() || "";

    const slugMatch = $('link[rel="canonical"]').attr("href")?.match(/\.com\/(.+)\/profil\//);
    const slug = slugMatch?.[1] ?? name.toLowerCase().replace(/\s+/g, "-");

    const infoItems: Record<string, string> = {};
    $(".info-table__content--regular").each((_i, el) => {
      const label = $(el).text().trim().replace(/:$/, "").toLowerCase();
      const bold = $(el).next(".info-table__content--bold");
      const value = bold.length ? bold.text().trim().replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim() : "";
      if (label && value) infoItems[label] = value;
    });

    const position = infoItems["position"] ?? "";
    const dobStr = infoItems["date of birth/age"] ?? "";
    const ageMatch = dobStr.match(/\((\d+)\)/);
    const dobMatch = dobStr.match(/(\d{2}\/\d{2}\/\d{4})/);
    const dateOfBirth = dobMatch ? dobMatch[1]!.split("/").reverse().join("-") : null;
    const age = ageMatch ? parseInt(ageMatch[1]!) : null;
    const citizenship = (infoItems["citizenship"] ?? "").replace(/\s+/g, " ").trim();
    const nationality = citizenship.split(" ").filter(Boolean).shift() || null;
    const heightStr = infoItems["height"] ?? "";
    const heightM = heightStr.match(/([\d,]+)\s*m/);
    const height = heightM ? parseFloat(heightM[1]!.replace(",", ".")) * 100 : null;
    const foot = infoItems["foot"] ?? null;
    const contractExpires = infoItems["contract expires"] ?? null;

    const mvMatch = metaDesc.match(/Market value:\s*€([\d.]+[km]?)/i);
    let marketValue: number | null = null;
    if (mvMatch) marketValue = parseMarketValue("€" + mvMatch[1]);

    const teamName = infoItems["current club"] ?? null;
    const teamEl = $(".data-header__box__club-link, a[href*='/verein/']").first();
    const teamIdMatch = teamEl.attr("href")?.match(/verein\/(\d+)/);
    const teamSlug = teamEl.attr("href")?.replace(/^\//, "").replace(/\/startseite\/.*$/, "") ?? "";

    const imageUrl = $('meta[property="og:image"]').attr("content") ?? null;

    const result = {
      id: playerId,
      name,
      slug,
      position: positionMap(position),
      dateOfBirth,
      age,
      nationality,
      height,
      foot,
      imageUrl,
      team: teamName ? { id: teamIdMatch ? parseInt(teamIdMatch[1]!) : 0, name: teamName, slug: teamSlug } : null,
      marketValue,
      contractExpires,
    };

    setTmCache(cacheKey, result, 60 * 60_000);
    return result;
  } catch (err) {
    logger.error({ err, playerId }, "Transfermarkt player profile fetch failed");
    return null;
  }
}
