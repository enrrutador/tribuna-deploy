/**
 * Default team colors when no brand color is provided.
 * Falls back to a deterministic color derived from the team name.
 */

const KNOWN_COLORS: Record<string, { bg: string; text: string }> = {
  // Argentina
  "Boca Juniors": { bg: "#1d3f9e", text: "#ffd400" },
  "River Plate": { bg: "#d70022", text: "#ffffff" },
  "Racing Club": { bg: "#1a4fa3", text: "#ffffff" },
  "Independiente": { bg: "#d4001a", text: "#ffffff" },
  "San Lorenzo": { bg: "#1a4fa3", text: "#a30034" },
  "Huracán": { bg: "#e4002b", text: "#ffffff" },
  "Vélez Sarsfield": { bg: "#1a3a8c", text: "#ffffff" },
  "Estudiantes": { bg: "#a0202c", text: "#ffffff" },
  "Gimnasia": { bg: "#ffffff", text: "#3a5f3a" },
  "Lanús": { bg: "#a50034", text: "#ffffff" },
  "Talleres": { bg: "#542693", text: "#ffffff" },
  "Rosario Central": { bg: "#1a4fa3", text: "#ffd400" },
  "Newell's Old Boys": { bg: "#a4001a", text: "#ffffff" },
  "Argentinos Juniors": { bg: "#d4001a", text: "#ffffff" },
  "Defensa y Justicia": { bg: "#0f8a4f", text: "#ffd400" },
  "Banfield": { bg: "#0f8a4f", text: "#ffffff" },
  "Unión": { bg: "#a4001a", text: "#ffffff" },
  "Colón": { bg: "#000000", text: "#ff0000" },
  "Belgrano": { bg: "#1a4fa3", text: "#ffd400" },
  "Platense": { bg: "#5a2d82", text: "#ffffff" },
  // Europa
  "Real Madrid": { bg: "#1a1a1a", text: "#ffd400" },
  "FC Barcelona": { bg: "#1a4fa3", text: "#a4001a" },
  "Atlético Madrid": { bg: "#d4001a", text: "#ffffff" },
  "Manchester City": { bg: "#6caee0", text: "#ffffff" },
  "Manchester United": { bg: "#a4001a", text: "#ffd400" },
  "Liverpool": { bg: "#c8102e", text: "#ffffff" },
  "Chelsea": { bg: "#1a4fa3", text: "#ffffff" },
  "Arsenal": { bg: "#ef0107", text: "#ffffff" },
  "Tottenham Hotspur": { bg: "#ffffff", text: "#0f2d52" },
  "Bayern Munich": { bg: "#dc052d", text: "#ffffff" },
  "Borussia Dortmund": { bg: "#ffd400", text: "#000000" },
  "Juventus": { bg: "#1a1a1a", text: "#ffffff" },
  "Inter Milan": { bg: "#1a4fa3", text: "#000000" },
  "AC Milan": { bg: "#a4001a", text: "#000000" },
  "Paris Saint-Germain": { bg: "#0f1c3f", text: "#da291c" },
  "Olympique de Marseille": { bg: "#1a4fa3", text: "#ffd400" },
};

const FALLBACK_PALETTE = [
  { bg: "#7c3aed", text: "#ffffff" },
  { bg: "#2563eb", text: "#ffffff" },
  { bg: "#dc2626", text: "#ffffff" },
  { bg: "#059669", text: "#ffffff" },
  { bg: "#d97706", text: "#ffffff" },
  { bg: "#db2777", text: "#ffffff" },
  { bg: "#0ea5e9", text: "#ffffff" },
  { bg: "#1a1a1a", text: "#84ff3d" },
];

/** Hash a string to a deterministic index. */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getTeamColors(name: string): { bg: string; text: string } {
  return KNOWN_COLORS[name] ?? FALLBACK_PALETTE[hashStr(name) % FALLBACK_PALETTE.length]!;
}
