import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Home, Zap, Trophy, Star, X } from "lucide-react";
import {
  useListTournaments,
  getListTournamentsQueryKey,
  useGetTodayMatches,
  getGetTodayMatchesQueryKey,
} from "@workspace/api-client-react";
import { useFavorites } from "@/hooks/useFavorites";
import { getTeamColor } from "@/utils/teamColors";

function LeaguesDrawer({ onClose }: { onClose: () => void }) {
  const { data } = useListTournaments({
    query: { queryKey: getListTournamentsQueryKey() },
  });

  const sections = [
    { label: "Destacados", items: data?.destacados ?? [] },
    { label: "Argentina", items: data?.argentina ?? [] },
    { label: "Sudamérica", items: data?.sudamerica ?? [] },
    { label: "Europa y Mundo", items: data?.world ?? [] },
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-[60]"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 z-[70] bg-[#111] rounded-t-2xl max-h-[78vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#222] shrink-0">
          <span className="text-white font-bold text-[15px]">Competencias</span>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto pb-20">
          {sections.map(({ label, items }) =>
            items.length === 0 ? null : (
              <div key={label}>
                <div className="px-4 pt-4 pb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#555]">
                    {label}
                  </span>
                </div>
                {items.map((t) => (
                  <Link key={t.id} href={`/torneo/${t.slug}`}>
                    <div
                      className="flex items-center gap-3 px-4 py-3 active:bg-white/10 transition-colors"
                      onClick={onClose}
                    >
                      <span className="text-[18px] shrink-0 leading-none">
                        {t.flagEmoji ?? "🏆"}
                      </span>
                      <span className="text-[14px] text-[#ccc] font-medium">
                        {t.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}

function FavoritesDrawer({ onClose }: { onClose: () => void }) {
  const { favoriteTeams, toggleTeam } = useFavorites();

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[60]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[70] bg-[#111] rounded-t-2xl max-h-[60vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#222] shrink-0">
          <span className="text-white font-bold text-[15px]">Mis Equipos</span>
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto pb-20">
          {favoriteTeams.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Star className="w-8 h-8 text-[#333] mx-auto mb-3" />
              <p className="text-[#666] text-[14px]">No seguís ningún equipo todavía</p>
              <p className="text-[#444] text-[12px] mt-1">
                Tocá ★ en cualquier partido para seguir un equipo
              </p>
            </div>
          ) : (
            favoriteTeams.map((team) => {
              const color = getTeamColor(team.name);
              return (
                <div key={team.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#1a1a1a]">
                  <Link href={`/equipo/${team.id}`} onClick={onClose} className="flex items-center gap-3 flex-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 overflow-hidden"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      {team.logoUrl
                        ? <img src={team.logoUrl} className="w-full h-full object-contain" alt="" />
                        : team.name.substring(0, 2).toUpperCase()
                      }
                    </div>
                    <span className="text-[14px] text-[#ccc] font-medium">{team.name}</span>
                  </Link>
                  <button
                    onClick={() => toggleTeam(team)}
                    className="text-amber-400 p-1"
                  >
                    <Star className="w-4 h-4 fill-amber-400" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default function BottomNav() {
  const [location] = useLocation();
  const [drawer, setDrawer] = useState<"leagues" | "favorites" | null>(null);
  const { favoriteTeams } = useFavorites();

  const { data: todayData } = useGetTodayMatches({
    query: {
      queryKey: getGetTodayMatchesQueryKey(),
      refetchInterval: 30_000,
    },
  });

  const liveCount = todayData?.liveCount ?? 0;
  const favCount = favoriteTeams.length;
  const isHome = location === "/";

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#1a1a1a]/96 backdrop-blur-lg border-t border-[#2a2a2a]">
        <div className="flex items-stretch h-[56px]">
          {/* Inicio */}
          <Link href="/" className="flex-1">
            <div className={`flex flex-col items-center justify-center h-full gap-0.5 transition-colors ${isHome ? "text-[#1a9be6]" : "text-[#555]"}`}>
              <Home className="w-[20px] h-[20px]" strokeWidth={isHome ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium tracking-tight">Inicio</span>
            </div>
          </Link>

          {/* En Vivo */}
          <Link href="/" className="flex-1">
            <div className={`flex flex-col items-center justify-center h-full gap-0.5 relative transition-colors ${liveCount > 0 ? "text-[#e53935]" : "text-[#555]"}`}>
              <div className="relative">
                <Zap className="w-[20px] h-[20px]" strokeWidth={1.8} fill={liveCount > 0 ? "currentColor" : "none"} />
                {liveCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#e53935] text-white text-[8px] font-black px-1 py-0 rounded-full leading-4 min-w-[14px] text-center">
                    {liveCount > 9 ? "9+" : liveCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight">En Vivo</span>
            </div>
          </Link>

          {/* Ligas */}
          <button className="flex-1" onClick={() => setDrawer("leagues")}>
            <div className="flex flex-col items-center justify-center h-full gap-0.5 text-[#555]">
              <Trophy className="w-[20px] h-[20px]" strokeWidth={1.8} />
              <span className="text-[10px] font-medium tracking-tight">Ligas</span>
            </div>
          </button>

          {/* Favoritos */}
          <button className="flex-1" onClick={() => setDrawer("favorites")}>
            <div className={`flex flex-col items-center justify-center h-full gap-0.5 relative transition-colors ${favCount > 0 ? "text-amber-400" : "text-[#555]"}`}>
              <div className="relative">
                <Star className="w-[20px] h-[20px]" strokeWidth={1.8} fill={favCount > 0 ? "currentColor" : "none"} />
                {favCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-400 text-black text-[8px] font-black px-1 py-0 rounded-full leading-4 min-w-[14px] text-center">
                    {favCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight">Favoritos</span>
            </div>
          </button>
        </div>
      </nav>

      {drawer === "leagues" && <LeaguesDrawer onClose={() => setDrawer(null)} />}
      {drawer === "favorites" && <FavoritesDrawer onClose={() => setDrawer(null)} />}
    </>
  );
}
