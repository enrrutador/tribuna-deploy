import { useState, useCallback } from "react";

const STORAGE_KEY = "cl_favorites";

export type FavoriteTeam = {
  id: string;
  name: string;
  logoUrl?: string | null;
};

type FavoritesStore = {
  teams: FavoriteTeam[];
};

function load(): FavoritesStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { teams: [] };
    return JSON.parse(raw) as FavoritesStore;
  } catch {
    return { teams: [] };
  }
}

function save(store: FavoritesStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function useFavorites() {
  const [store, setStore] = useState<FavoritesStore>(load);

  const isTeamFavorite = useCallback(
    (id: string) => store.teams.some((t) => t.id === id),
    [store]
  );

  const toggleTeam = useCallback((team: FavoriteTeam) => {
    setStore((prev) => {
      const exists = prev.teams.some((t) => t.id === team.id);
      const next: FavoritesStore = {
        ...prev,
        teams: exists
          ? prev.teams.filter((t) => t.id !== team.id)
          : [...prev.teams, team],
      };
      save(next);
      return next;
    });
  }, []);

  return { favoriteTeams: store.teams, isTeamFavorite, toggleTeam };
}
