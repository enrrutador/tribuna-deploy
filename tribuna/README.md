# ⚽ Tribuna — Fútbol en vivo

Plataforma de fútbol en vivo con estética **glassmorphism oscuro**. Resultados, fixture, tablas, estadísticas, eventos y favoritos del fútbol argentino y mundial — con datos en tiempo real.

> Paleta: **carbón profundo + verde lima eléctrico + cyan hielo + magenta neón** (luces de estadio de noche).

---

## ✨ Características

### Funcionalidades del proyecto original
- ✅ Resultados en vivo y fixture por torneo
- ✅ Tabla de posiciones con zonas (Libertadores / Descenso)
- ✅ Goleadores por torneo
- ✅ Ficha del partido con eventos (goles, tarjetas, cambios, VAR)
- ✅ Estadísticas comparativas (posesión, tiros, corners, etc.)
- ✅ Navegación por 25 torneos (Mundial, Libertadores, ligas europeas y sudamericanas)
- ✅ Manejo correcto de zona horaria argentina (ART, UTC-3)

### Funcionalidades NUEVAS agregadas
- 🌟 **Sistema de favoritos** persistente (equipos + torneos) con localStorage
- 📊 **Widget de predicción** interactivo con distribución de votos
- 🎯 **Timeline animado** de eventos separado por tiempo (1er/2do)
- 📈 **Barras de estadísticas animadas** con gradientes
- 🔍 **Buscador global** en el header
- 📅 **Navegación por fecha** (día anterior / hoy / día siguiente)
- 🗂️ **Filtros** (Todos / Vivo / Finalizados / Próximos)
- 📱 **PWA instalable** (manifest + iconos + theme color)
- 🎬 **Transiciones de página** y micro-interacciones (Framer Motion)
- 🏟️ **Ticker de partidos en vivo** desplazándose en el header
- 🌗 **Tema glassmorphism** completo con tokens de diseño
- 🛡️ **Error boundary** + estados de carga/error/vacío en cada vista

---

## 🎨 Sistema de diseño

```
Fondo        #050608 → #0a0c12 → #11141d   (carbón profundo)
Acento 1     #84ff3d  (verde lima eléctrico — deporte/energía)
Acento 2     #00e5ff  (cyan hielo — datos/tech)
Acento 3     #ff2d9b  (magenta neón — vivo/emoción)
En vivo      #ff3850  (rojo pulsante)
```

**Tipografías:** Space Grotesk (display), Inter (texto), JetBrains Mono (números).
**Efectos:** glassmorphism (blur + saturación), glows neón, gradientes animados, patrón de grilla sutil tipo césped tech.

---

## 🚀 Cómo ejecutar

### Requisitos
- Node.js 20+
- npm (incluido con Node)

### Instalación y desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar backend + frontend en paralelo
npm run dev
```

Esto arranca:
- **API server** en `http://localhost:8787` (backend con caché)
- **Frontend Vite** en `http://localhost:5173` (con proxy a la API)

Abrí **http://localhost:5173** en el navegador.

> 💡 El frontend hace proxy de `/api/*` al backend automáticamente, así que no necesitás configurar CORS en desarrollo.

### Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Backend + Frontend en paralelo (desarrollo) |
| `npm run dev:server` | Solo backend (puerto 8787) |
| `npm run dev:web` | Solo frontend (puerto 5173) |
| `npm run build` | Compila TypeScript + empaqueta Vite para producción |
| `npm run preview` | Sirve el build de producción |
| `npm run typecheck` | Solo verificación de tipos |

### Variables de entorno (opcionales)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `8787` | Puerto del API server |
| `VITE_API_URL` | `/api` | URL base de la API para el frontend |

---

## 🏗️ Arquitectura

```
tribuna/
├── server/                    # Backend Express (proxy + caché)
│   ├── index.ts               # App Express + rutas REST
│   └── lib/
│       └── espn.ts            # Cliente de datos con tipado + caché TTL
│
├── src/                       # Frontend React 19 + Vite
│   ├── main.tsx               # Entry + providers (QueryClient, ErrorBoundary)
│   ├── App.tsx                # Routing (wouter) + transiciones
│   ├── styles/
│   │   └── index.css          # Design system (Tailwind 4 + tokens)
│   ├── lib/
│   │   ├── api.ts             # Cliente HTTP tipado
│   │   ├── hooks.ts           # Hooks TanStack Query
│   │   ├── types.ts           # Tipos de dominio
│   │   ├── utils.ts           # Helpers (fechas ART, cn, etc.)
│   │   ├── favorites.ts       # Store Zustand (favoritos persistentes)
│   │   └── teamColors.ts      # Colores oficiales de clubes
│   ├── components/
│   │   ├── ui/                # Primitivos (GlassCard, Button, Badge…)
│   │   ├── layout/            # Header, Sidebar, Footer, BottomNav
│   │   └── domain/            # MatchRow, EventTimeline, StandingsTable…
│   └── pages/                 # Home, Live, Tournament, MatchDetail, Team…
│
└── public/                    # manifest, favicon, íconos PWA
```

### Stack
- **Frontend:** React 19, Vite 6, TypeScript estricto, Tailwind CSS 4, Framer Motion, TanStack Query 5, wouter, Zustand, Recharts, lucide-react
- **Backend:** Express 5, TypeScript, caché en memoria con TTL diferenciado

---

## 🔌 API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check + estadísticas de caché |
| GET | `/api/tournaments` | Lista de 25 torneos agrupados por categoría |
| GET | `/api/tournaments/:slug` | Info de un torneo |
| GET | `/api/tournaments/:slug/fixtures` | Fixture del torneo |
| GET | `/api/tournaments/:slug/standings` | Tabla de posiciones |
| GET | `/api/tournaments/:slug/scorers` | Goleadores |
| GET | `/api/matches` | Partidos (filtros `?status=` y `?date=`) |
| GET | `/api/matches/today` | Partidos de hoy (hora argentina) |
| GET | `/api/matches/live` | Partidos en vivo ahora |
| GET | `/api/matches/:id` | Detalle del partido + eventos + estadísticas |

Los IDs de partido tienen formato `leagueId:matchId` (ej: `fifa.world:401865560`).

---

## 🌍 Torneos incluidos (25)

| Categoría | Torneos |
|-----------|---------|
| ⭐ Destacados | Mundial 2026, Libertadores, Sudamericana, Eliminatorias, Champions, Europa, Conference |
| 🇦🇷 Argentina | Liga Profesional, Primera Nacional |
| 🌎 Sudamérica | Brasileirao, Uruguay, Chile, Colombia, Ecuador, Perú, Paraguay, Liga MX |
| 🌍 Mundo | Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Eredivisie, Primeira Liga, MLS |

---

## 📝 Notas

- **Caché inteligente:** TTL dinámico (15s para partidos en vivo, 60s para finalizados, 5-10min para tablas/goleadores).
- **Zona horaria:** Todo se calcula en ART (UTC-3, sin DST). Un día argentino abarca 2 días UTC y se deduplica.
- **Datos reales:** Si no hay partidos un día dado, la UI lo muestra claramente (estado vacío) en lugar de inventar datos.

---

Hecho con ❤️ en Argentina
