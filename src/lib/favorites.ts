import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoriteTeam {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  color: string;
}

interface FavoritesState {
  teams: FavoriteTeam[];
  tournaments: string[]; // slugs
  toggleTeam: (team: FavoriteTeam) => void;
  toggleTournament: (slug: string) => void;
  isFavoriteTeam: (id: string) => boolean;
  isFavoriteTournament: (slug: string) => boolean;
  clear: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      teams: [],
      tournaments: [],

      toggleTeam: (team) =>
        set((s) => {
          const exists = s.teams.some((t) => t.id === team.id);
          return {
            teams: exists
              ? s.teams.filter((t) => t.id !== team.id)
              : [...s.teams, team],
          };
        }),

      toggleTournament: (slug) =>
        set((s) => ({
          tournaments: s.tournaments.includes(slug)
            ? s.tournaments.filter((t) => t !== slug)
            : [...s.tournaments, slug],
        })),

      isFavoriteTeam: (id) => get().teams.some((t) => t.id === id),
      isFavoriteTournament: (slug) => get().tournaments.includes(slug),

      clear: () => set({ teams: [], tournaments: [] }),
    }),
    { name: "tribuna-favorites" }
  )
);
