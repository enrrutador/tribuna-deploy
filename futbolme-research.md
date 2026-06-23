# Futbolme.com Research - API & Data Access

## Summary

**No public/free API exists.** Futbolme is a traditional PHP server-rendered site with no documented API. However, several internal AJAX endpoints were discovered that return HTML fragments or proxy JSON from third-party APIs.

---

## Data They Offer

Futbolme's unique value is **Spanish lower-division football** that's hard to find elsewhere:

### Spanish Leagues (primary focus)
- **1ª División** (La Liga) - tournament ID 1
- **2ª División** - tournament ID 2
- **1ª RFEF (Federación)** - Groups 1-2 (tournament IDs 3055, 3056)
- **2ª RFEF** - Groups 1-5 (tournament IDs 3057-3061)
- **3ª RFEF** - Groups 1-18 (tournament IDs 3063-3081)
- **Preferente / Autonómicas** (regional leagues)
- **Juvenil** (youth leagues)
- **Femenino** (women's leagues)

### Promotions / Relegations
- `/ascensos-y-descensos/nacional` - Full national promotion/relegation tracker
- Promoción a 1ª (tourney 239)
- Promoción a 2ª (tourney 3137)
- Promoción a 1ª Fed. (tourney 3127)
- Permanencia 2ª Fed. (tourney 3128)
- Promoción a 2ª Fed. (tourney 3129)
- All 18 Tercera groups have individual promotion playoffs

### Data per tournament page
- Match results (live + historical) by jornada
- League standings/classification (clasificación)
- Historical head-to-head
- Goleadores (top scorers)
- Zamoras (best goalkeepers)
- Match lineups (alineaciones)
- Goals, cards details
- TV broadcast info (`/partidos-televisados`)

### International (via sports-me.com)
- Major European leagues, UEFA competitions, FIFA tournaments

---

## Discovered Endpoints

### 1. JSON endpoint (third-party proxy)
**`POST /apiBetsapi.php`**
- Accepts: `id` (event ID from BetsAPI)
- Returns: **JSON** with lineups (`results.home.startinglineup`, `results.away.startinglineup`)
- Source: Proxies [BetsAPI.com](https://betsapi.com) data
- Requires valid BetsAPI event ID

### 2. JSON endpoint (third-party proxy)
**`POST /apiBetsapiEventos.php`**
- Accepts: `id` (event ID)
- Returns: **JSON** with live events (`results[0].events[].text`)
- Source: Proxies BetsAPI events

### 3. HTML fragment endpoints (PHP backend)
These return **HTML fragments** (not JSON), injected into the page via AJAX:

| Endpoint | Method | Params | Returns |
|----------|--------|--------|---------|
| `/appestanas.php` | POST | `s=jornada&p=&l=&j=` | Jornada tab content |
| `/appestanas.php` | POST | `s=clas&p=&l=` | Classification tab |
| `/appestanas.php` | POST | `s=his&p=&e=&l=` | Historical tab |
| `/z_visorHoy.php` | POST | `temporada_id=&comunidad_id=` | Today's matches panel |
| `/z_visor_twitter.php` | POST | `partido_id=` | Match Twitter feed |
| `/z_hemeroteca.php` | POST | `id=` | Team archive/hemeroteca |
| `/z_play_clasi` | POST | `temporada_id=&jornada=` | Classification replay |

### 4. Internal admin endpoints (require auth, not useful)
- `/src/funciones/validarResultado.php`
- `/src/funciones/enviarResultado.php`
- `/src/funciones/mostrarClasificacion.php`
- `/src/funciones/alineaciones.php`
- `/src/funciones/alineaciones/alineacionPartido.php`
- `/src/funciones/calendario/editar_partido.php`
- `/src/funciones/verPartido.php`
- `/src/funciones/mostrarPlantilla.php`
- `/src/funciones/apuestas.php`
- `/src/funciones/guardarPartidoApi.php`
- `/src/funciones/guardarEquipoApi.php`
- `/src/funciones/insertarPartidoBetsapi.php`

---

## URL Patterns (Scrapable)

### Tournament pages (main data source)
```
/resultados-directo/torneo/{slug}/{tournament_id}/
```
Examples:
- `/resultados-directo/torneo/primera-division/1/`
- `/resultados-directo/torneo/segunda-division/2/`
- `/resultados-directo/torneo/tercera-federacion-grupo-1/3076/`
- `/resultados-directo/torneo/espana-segunda-division-promocion-de-ascenso/239/`

### Promotions/Relegations
```
/ascensos-y-descensos/nacional
```

### TV broadcasts
```
/partidos-televisados
```

---

## Technical Stack
- **Backend**: PHP (legacy, many `.php` files)
- **Frontend**: jQuery 3.5.1 + Bootstrap 4.5, server-rendered HTML
- **No REST API**: All data served as HTML pages or HTML fragments
- **No authentication wall** on public tournament pages
- **Auto-refresh**: Homepage refreshes `#contenedorCentral` every 120 seconds via AJAX GET
- **Search**: Uses Finderant (SaaS search) with team/player search (currently commented out)

---

## Scraping Feasibility

### Easy to scrape
- Tournament pages are publicly accessible, no login required
- Clean URL structure with tournament IDs
- HTML is well-structured with Bootstrap classes
- `#contenedorCentral` div contains main match data

### Challenges
- No JSON API - must parse HTML
- Heavy ad content (Vidoomy, Refinery89, LinkOnClick)
- Age verification modal (can be dismissed/bypassed)
- `comunsite.min.js` uses `appestanas.php` for tab switching (jornada, clasificación, histórico) - these are POST endpoints returning HTML fragments
- Rate limiting unknown - be respectful

### Recommended scraping approach
1. **Tournament pages**: GET `/resultados-directo/torneo/{slug}/{id}/` - parse HTML for matches + standings
2. **Tab data**: POST `/appestanas.php` with `s=clas&p=1&l={tournament_id}` for classification
3. **Jornada switching**: POST `/appestanas.php` with `s=jornada&p=0&l={tournament_id}&j={jornada_number}`
4. **Promotions page**: GET `/ascensos-y-descensos/nacional` for promotion/relegation data

---

## No Public API Documentation Found
- `/api/`, `/api/partidos`, `/api/datos`, `/api/partidos.json` all return 404
- No API docs, swagger, or developer portal found
- No community-known API (no results for "futbolme API" searches)
- The `apiBetsapi.php` and `apiBetsapiEventos.php` are the only JSON-returning endpoints, but they proxy a paid third-party service (BetsAPI)

---

## Key Tournament IDs (2025-26 Season)

| ID | Tournament |
|----|-----------|
| 1 | Primera División |
| 2 | Segunda División |
| 239 | Promoción de Ascenso a 1ª |
| 3055-3056 | 1ª RFEF Grupo 1-2 |
| 3057-3061 | 2ª RFEF Grupo 1-5 |
| 3063-3081 | 3ª RFEF Grupo 1-18 |
| 3127 | Promoción Ascenso 1ª RFEF |
| 3128 | Permanencia 2ª RFEF |
| 3129 | Promoción Ascenso 2ª RFEF |
| 3137 | Promoción Ascenso a 2ª |
| 3138 | Campeón Absoluto 1ª RFEF |
