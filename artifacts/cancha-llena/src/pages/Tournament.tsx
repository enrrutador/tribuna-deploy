import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import {
  useGetTournamentBySlug,
  getGetTournamentBySlugQueryKey,
  useGetTournamentStandings,
  getGetTournamentStandingsQueryKey,
  useGetTournamentScorers,
  getGetTournamentScorersQueryKey,
  useGetTournamentFixtures,
  getGetTournamentFixturesQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Trophy, Target, Calendar } from "lucide-react";
import MatchGroupCard from "@/components/MatchGroupCard";
import { getTeamColor } from "@/utils/teamColors";

function TeamBadge({ id, name, logoUrl, clickable = false }: { id?: number; name: string; logoUrl?: string | null; clickable?: boolean }) {
  const color = getTeamColor(name);
  const [, navigate] = useLocation();

  const badge = (
    <div
      className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 overflow-hidden ${clickable ? "cursor-pointer hover:ring-2 hover:ring-[#1a9be6] hover:ring-offset-1 transition-all" : ""}`}
      style={{ backgroundColor: color.bg, color: color.text }}
      onClick={clickable && id ? (e) => { e.stopPropagation(); navigate(`/equipo/${id}`); } : undefined}
    >
      {logoUrl
        ? <img src={logoUrl} className="w-full h-full object-contain" alt="" />
        : name.substring(0, 2).toUpperCase()
      }
    </div>
  );
  return badge;
}

type Tab = "partidos" | "tabla" | "goleadores";

export default function Tournament() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const [activeTab, setActiveTab] = useState<Tab>("partidos");
  const [, navigate] = useLocation();

  const { data: tournament, isLoading: loadingTournament } = useGetTournamentBySlug(slug, {
    query: { queryKey: getGetTournamentBySlugQueryKey(slug), enabled: !!slug },
  });

  const tournamentId = (tournament?.id ?? "") as unknown as number;
  const hasId = !!tournament?.id;

  const { data: fixturesData, isLoading: loadingFixtures } = useGetTournamentFixtures(
    tournamentId,
    {},
    {
      query: {
        queryKey: getGetTournamentFixturesQueryKey(tournamentId, {}),
        enabled: hasId && activeTab === "partidos",
        refetchInterval: 30_000,
      },
    }
  );

  const { data: standingsData, isLoading: loadingStandings } = useGetTournamentStandings(
    tournamentId,
    {
      query: {
        queryKey: getGetTournamentStandingsQueryKey(tournamentId),
        enabled: hasId && activeTab === "tabla",
      },
    }
  );

  const { data: scorersData, isLoading: loadingScorers } = useGetTournamentScorers(
    tournamentId,
    {
      query: {
        queryKey: getGetTournamentScorersQueryKey(tournamentId),
        enabled: hasId && activeTab === "goleadores",
      },
    }
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "partidos", label: "Partidos", icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: "tabla", label: "Tabla", icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: "goleadores", label: "Goleadores", icon: <Target className="w-3.5 h-3.5" /> },
  ];

  if (loadingTournament) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[64px] w-full rounded-sm" />
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="bg-white border border-gray-200 rounded-sm p-8 text-center">
        <p className="text-gray-500 mb-4">Torneo no encontrado.</p>
        <Link href="/" className="text-[#1a9be6] hover:underline text-sm">← Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tournament banner */}
      <div className="bg-[#1a1a2e] rounded-sm overflow-hidden flex items-center justify-between h-[64px] relative">
        <div className="absolute right-0 top-0 bottom-0 w-32 opacity-30 hex-pattern" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#1a9be6]/30 to-transparent" />

        <div className="flex items-center gap-3 px-4 z-10">
          <div className="w-9 h-9 bg-[#1a9be6] rounded-sm flex items-center justify-center text-xl shrink-0">
            {tournament.flagEmoji ?? "🏆"}
          </div>
          <div>
            <div className="text-white font-bold text-[15px] leading-tight">{tournament.name}</div>
            <div className="text-gray-400 text-[11px] capitalize">
              {(tournament as any).country ?? (tournament.category === "argentina" ? "Argentina" : tournament.category === "destacados" ? "Destacado" : "Internacional")}
            </div>
          </div>
        </div>

        <Link href="/" className="flex items-center gap-1 text-gray-400 hover:text-gray-200 transition-colors text-[12px] px-4 z-10">
          <ChevronLeft className="w-3.5 h-3.5" />
          Volver
        </Link>
      </div>

      {/* Tournament metadata */}
      {((tournament as any).description || (tournament as any).currentChampion || (tournament as any).format) && (
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            {(tournament as any).description && (
              <div className="px-4 py-3 col-span-2 border-b border-gray-100">
                <p className="text-[13px] text-gray-600 leading-relaxed">{(tournament as any).description}</p>
              </div>
            )}
            {(tournament as any).currentChampion && (
              <div className="px-4 py-3">
                <div className="text-[11px] text-gray-400 uppercase font-semibold tracking-wide">Campeón actual</div>
                <div className="text-[13px] text-gray-800 font-semibold mt-0.5 flex items-center gap-1">
                  🏆 {(tournament as any).currentChampion}
                </div>
              </div>
            )}
            {(tournament as any).participantCount && (
              <div className="px-4 py-3">
                <div className="text-[11px] text-gray-400 uppercase font-semibold tracking-wide">Participantes</div>
                <div className="text-[13px] text-gray-800 font-semibold mt-0.5">{(tournament as any).participantCount} equipos</div>
              </div>
            )}
            {(tournament as any).format && (
              <div className="px-4 py-3 col-span-2 border-t border-gray-100">
                <div className="text-[11px] text-gray-400 uppercase font-semibold tracking-wide">Formato</div>
                <div className="text-[13px] text-gray-600 mt-0.5">{(tournament as any).format}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-0 bg-white border border-gray-200 rounded-sm overflow-hidden w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-5 py-2 text-[13px] font-medium transition-colors border-r border-gray-200 last:border-r-0 ${
              activeTab === tab.id
                ? "bg-[#1e1e1e] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "partidos" && (
        <>
          {loadingFixtures ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-sm p-4 space-y-3">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : !fixturesData?.groups[0]?.matches.length ? (
            <div className="bg-white border border-gray-200 rounded-sm p-10 text-center text-gray-500">
              No hay partidos registrados para este torneo.
            </div>
          ) : (
            <div className="space-y-3">
              {fixturesData?.groups.map((group) => (
                <MatchGroupCard key={group.tournament.id} group={group} showLink={false} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "tabla" && (
        <>
          {loadingStandings ? (
            <Skeleton className="h-64 w-full rounded-sm" />
          ) : !standingsData?.standings.length ? (
            <div className="bg-white border border-gray-200 rounded-sm p-10 text-center text-gray-500">
              No hay tabla de posiciones disponible.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-[#f5f5f5] border-b text-gray-400 text-[11px] uppercase tracking-wider">
                    <th className="px-3 py-2.5 text-left w-7">#</th>
                    <th className="px-3 py-2.5 text-left">Equipo</th>
                    <th className="px-2 py-2.5 text-center w-9">PJ</th>
                    <th className="px-2 py-2.5 text-center w-9">G</th>
                    <th className="px-2 py-2.5 text-center w-9">E</th>
                    <th className="px-2 py-2.5 text-center w-9">P</th>
                    <th className="px-2 py-2.5 text-center w-10">GF</th>
                    <th className="px-2 py-2.5 text-center w-10">GC</th>
                    <th className="px-2 py-2.5 text-center w-10">DG</th>
                    <th className="px-2 py-2.5 text-center w-10 font-bold text-gray-600">Pts</th>
                    <th className="px-3 py-2.5 text-center hidden md:table-cell">Forma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {standingsData.standings.map((row, idx) => (
                    <tr
                      key={row.team.id}
                      className={`hover:bg-[#f8faff] transition-colors cursor-pointer ${idx < 4 ? "border-l-2 border-l-[#1a9be6]" : idx < 6 ? "border-l-2 border-l-amber-400" : "border-l-2 border-l-transparent"}`}
                      onClick={() => navigate(`/equipo/${row.team.id}`)}
                    >
                      <td className="px-3 py-2.5 text-gray-400 font-medium">{row.position}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <TeamBadge id={row.team.id} name={row.team.name} logoUrl={row.team.logoUrl} clickable />
                          <span className="font-semibold text-gray-900 hover:text-[#1a9be6] transition-colors">{row.team.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-center text-gray-500">{row.played}</td>
                      <td className="px-2 py-2.5 text-center text-gray-500">{row.won}</td>
                      <td className="px-2 py-2.5 text-center text-gray-500">{row.drawn}</td>
                      <td className="px-2 py-2.5 text-center text-gray-500">{row.lost}</td>
                      <td className="px-2 py-2.5 text-center text-gray-500">{row.goalsFor}</td>
                      <td className="px-2 py-2.5 text-center text-gray-500">{row.goalsAgainst}</td>
                      <td className="px-2 py-2.5 text-center text-gray-500">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-gray-900">{row.points}</td>
                      <td className="px-3 py-2.5 hidden md:table-cell">
                        {row.form && (
                          <div className="flex items-center justify-center gap-0.5">
                            {row.form.split("").map((r, i) => (
                              <span
                                key={i}
                                className={`w-4 h-4 rounded-sm text-white text-[9px] flex items-center justify-center font-bold leading-none ${
                                  r === "W" ? "bg-green-500" : r === "D" ? "bg-amber-400" : "bg-red-500"
                                }`}
                              >
                                {r === "W" ? "G" : r === "D" ? "E" : "P"}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2.5 bg-[#f5f5f5] border-t flex gap-4 text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-3 bg-[#1a9be6] rounded-sm inline-block" />
                  Clasificación directa
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-3 bg-amber-400 rounded-sm inline-block" />
                  Playoff
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "goleadores" && (
        <>
          {loadingScorers ? (
            <Skeleton className="h-64 w-full rounded-sm" />
          ) : !scorersData?.scorers.length ? (
            <div className="bg-white border border-gray-200 rounded-sm p-10 text-center text-gray-500">
              No hay datos de goleadores disponibles.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-[#f5f5f5] border-b text-gray-400 text-[11px] uppercase tracking-wider">
                    <th className="px-3 py-2.5 text-left w-7">#</th>
                    <th className="px-3 py-2.5 text-left">Jugador</th>
                    <th className="px-3 py-2.5 text-left hidden sm:table-cell">Equipo</th>
                    <th className="px-3 py-2.5 text-center w-14">PJ</th>
                    <th className="px-3 py-2.5 text-center w-14">Asist.</th>
                    <th className="px-3 py-2.5 text-center w-14 font-bold text-gray-600">Goles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {scorersData.scorers.map((entry) => (
                    <tr
                      key={entry.player.id}
                      className="hover:bg-[#f8faff] transition-colors cursor-pointer"
                      onClick={() => navigate(`/equipo/${entry.team.id}`)}
                    >
                      <td className="px-3 py-3 text-gray-400 font-medium">{entry.position}</td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-gray-900">{entry.player.name}</div>
                        {entry.player.nationality && (
                          <div className="text-[11px] text-gray-400">{entry.player.nationality}</div>
                        )}
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <TeamBadge id={entry.team.id} name={entry.team.name} logoUrl={entry.team.logoUrl} clickable />
                          <span className="text-gray-600 hover:text-[#1a9be6] transition-colors">{entry.team.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-500">{entry.played}</td>
                      <td className="px-3 py-3 text-center text-gray-500">{entry.assists}</td>
                      <td className="px-3 py-3 text-center font-bold text-gray-900 text-[16px]">{entry.goals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
