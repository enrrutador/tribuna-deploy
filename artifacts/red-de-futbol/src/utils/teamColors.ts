export interface TeamColor {
  bg: string;
  text: string;
  border?: string;
}

const TEAM_COLORS: Record<string, TeamColor> = {
  "River Plate": { bg: "#E30613", text: "#FFFFFF", border: "#E30613" },
  "Boca Juniors": { bg: "#003DA5", text: "#F5D806", border: "#003DA5" },
  "Racing Club": { bg: "#2257A5", text: "#FFFFFF", border: "#2257A5" },
  "Independiente": { bg: "#C8001D", text: "#FFFFFF", border: "#C8001D" },
  "San Lorenzo": { bg: "#1B5FA8", text: "#FFFFFF", border: "#1B5FA8" },
  "Huracán": { bg: "#0047AB", text: "#FFFFFF", border: "#0047AB" },
  "Vélez Sarsfield": { bg: "#004B97", text: "#FFFFFF", border: "#004B97" },
  "Newell's Old Boys": { bg: "#CC0000", text: "#000000", border: "#CC0000" },
  "Estudiantes (RC)": { bg: "#C8001D", text: "#FFFFFF", border: "#C8001D" },
  "Instituto": { bg: "#CC0000", text: "#000000", border: "#CC0000" },
  "Quilmes": { bg: "#1A2FA1", text: "#FFFFFF", border: "#1A2FA1" },
  "Chacarita": { bg: "#000000", text: "#FFFFFF", border: "#333" },
  "Gimnasia Tiro": { bg: "#006400", text: "#FFFFFF", border: "#006400" },
  "Agropecuario": { bg: "#006400", text: "#FFFF00", border: "#006400" },
  "Gimnasia (M)": { bg: "#1A2FA1", text: "#FFFFFF", border: "#1A2FA1" },
  "Defensa y Justicia": { bg: "#FFD700", text: "#006400", border: "#FFD700" },
  "Chelsea": { bg: "#034694", text: "#FFFFFF", border: "#034694" },
  "Nottingham Forest": { bg: "#CC0000", text: "#FFFFFF", border: "#CC0000" },
  "Everton": { bg: "#003399", text: "#FFFFFF", border: "#003399" },
  "Manchester City": { bg: "#6CABDD", text: "#FFFFFF", border: "#6CABDD" },
  "Real Madrid": { bg: "#FEBE10", text: "#000080", border: "#FEBE10" },
  "Barcelona": { bg: "#A50044", text: "#EDBB00", border: "#A50044" },
  "Bayern Munich": { bg: "#DC052D", text: "#FFFFFF", border: "#DC052D" },
  "Borussia Dortmund": { bg: "#FDE100", text: "#000000", border: "#FDE100" },
  "Juventus": { bg: "#000000", text: "#FFFFFF", border: "#333" },
  "Inter Milan": { bg: "#010E80", text: "#FFFFFF", border: "#010E80" },
  "Flamengo": { bg: "#1a1a1a", text: "#CC0000", border: "#CC0000" },
  "Palmeiras": { bg: "#006437", text: "#FFFFFF", border: "#006437" },
  "Argentina": { bg: "#75AADB", text: "#FFFFFF", border: "#75AADB" },
  "Brasil": { bg: "#009C3B", text: "#FFDF00", border: "#009C3B" },
  "Francia": { bg: "#002395", text: "#FFFFFF", border: "#002395" },
  "España": { bg: "#C60B1E", text: "#FFC300", border: "#C60B1E" },
};

export function getTeamColor(teamName: string): TeamColor {
  return TEAM_COLORS[teamName] ?? { bg: "#4a4a6a", text: "#FFFFFF", border: "#4a4a6a" };
}

export interface BroadcasterStyle {
  bg: string;
  text: string;
  label: string;
}

const BROADCASTER_STYLES: Record<string, BroadcasterStyle> = {
  "ESPN": { bg: "#CC0000", text: "#FFFFFF", label: "E" },
  "ESPN 2": { bg: "#CC0000", text: "#FFFFFF", label: "E2" },
  "ESPN 3": { bg: "#CC0000", text: "#FFFFFF", label: "E3" },
  "ESPN Premium": { bg: "#CC0000", text: "#FFFFFF", label: "EP" },
  "TNT Sports": { bg: "#6B0AC9", text: "#FFFFFF", label: "T" },
  "HBO Max": { bg: "#8020BE", text: "#FFFFFF", label: "H" },
  "Telefe": { bg: "#0066CC", text: "#FFFFFF", label: "TF" },
  "TyC Sports": { bg: "#E30613", text: "#FFFFFF", label: "TY" },
  "DSports": { bg: "#FF6600", text: "#FFFFFF", label: "D" },
  "DIRECTV": { bg: "#0099E6", text: "#FFFFFF", label: "DV" },
};

export function getBroadcasterStyle(channel: string | null | undefined): BroadcasterStyle | null {
  if (!channel) return null;
  return BROADCASTER_STYLES[channel] ?? { bg: "#555", text: "#FFF", label: channel.substring(0, 2) };
}
