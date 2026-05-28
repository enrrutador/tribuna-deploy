import { Link, useLocation } from "wouter";
import { useListTournaments, getListTournamentsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "./ui/skeleton";
import { useFavorites } from "@/hooks/useFavorites";
import { getTeamColor } from "@/utils/teamColors";
import { Star } from "lucide-react";

type Tournament = { id: number; name: string; slug: string; logoUrl?: string | null; flagEmoji?: string | null };

function TournamentItem({ tournament }: { tournament: Tournament }) {
  const [location] = useLocation();
  const isActive = location === `/torneo/${tournament.slug}`;

  return (
    <li>
      <Link href={`/torneo/${tournament.slug}`}>
        <div className={`w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] cursor-pointer transition-all ${
          isActive
            ? "bg-[#0066cc]/15 border-l-2 border-l-[#1a9be6] text-white"
            : "border-l-2 border-l-transparent text-[#aaa] hover:text-white hover:bg-white/5"
        }`}>
          <div className="w-5 h-5 flex items-center justify-center shrink-0 text-base leading-none">
            {tournament.logoUrl ? (
              <img src={tournament.logoUrl} alt="" className="w-4 h-4 object-contain" />
            ) : tournament.flagEmoji ? (
              tournament.flagEmoji
            ) : (
              <div className="w-4 h-4 bg-[#444] rounded-sm" />
            )}
          </div>
          <span className={`truncate font-medium ${isActive ? "text-white" : ""}`}>{tournament.name}</span>
        </div>
      </Link>
    </li>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-3 pt-5 pb-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#555]">{label}</span>
    </div>
  );
}

function SkeletonItems({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-0.5 px-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full bg-[#2a2a2a] rounded-none" />
      ))}
    </div>
  );
}

function FavoriteTeamsSection() {
  const { favoriteTeams, toggleTeam } = useFavorites();
  const [location] = useLocation();

  if (!favoriteTeams.length) return null;

  return (
    <>
      <SectionLabel label="Mis Equipos" />
      <ul>
        {favoriteTeams.map((team) => {
          const color = getTeamColor(team.name);
          const isActive = location === `/equipo/${team.id}`;
          return (
            <li key={team.id}>
              <div className={`w-full flex items-center gap-2.5 px-3 py-[7px] text-[13px] cursor-pointer transition-all group ${
                isActive
                  ? "bg-[#0066cc]/15 border-l-2 border-l-amber-400 text-white"
                  : "border-l-2 border-l-transparent text-[#aaa] hover:text-white hover:bg-white/5"
              }`}>
                <Link href={`/equipo/${team.id}`} className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 overflow-hidden"
                    style={{ backgroundColor: color.bg, color: color.text }}
                  >
                    {team.logoUrl
                      ? <img src={team.logoUrl} className="w-full h-full object-contain" alt="" />
                      : team.name.substring(0, 2).toUpperCase()
                    }
                  </div>
                  <span className="truncate font-medium">{team.name}</span>
                </Link>
                <button
                  onClick={() => toggleTeam(team)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-400 hover:text-amber-300 p-0.5"
                  title="Dejar de seguir"
                >
                  <Star className="w-3 h-3 fill-amber-400" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function Sidebar() {
  const { data: tournamentsData, isLoading } = useListTournaments({
    query: { queryKey: getListTournamentsQueryKey() }
  });

  return (
    <aside className="w-[250px] bg-[#111] h-full flex flex-col overflow-y-auto hidden md:flex shrink-0 border-r border-[#222]">
      {isLoading ? (
        <div className="space-y-4 pt-4">
          <SkeletonItems count={5} />
          <SkeletonItems count={12} />
        </div>
      ) : (
        <nav>
          {/* Favorite teams — shown when user follows at least one */}
          <FavoriteTeamsSection />

          <SectionLabel label="Destacados" />
          <ul>
            {tournamentsData?.destacados?.map((t) => <TournamentItem key={t.id} tournament={t} />)}
          </ul>

          <SectionLabel label="Argentina" />
          <ul>
            {tournamentsData?.argentina?.map((t) => <TournamentItem key={t.id} tournament={t} />)}
          </ul>

          <SectionLabel label="Resto del Mundo" />
          <ul className="pb-6">
            {tournamentsData?.world?.map((t) => <TournamentItem key={t.id} tournament={t} />)}
          </ul>
        </nav>
      )}
    </aside>
  );
}
