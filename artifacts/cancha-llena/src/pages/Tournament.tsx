import { useState } from "react";
import { useParams, Link } from "wouter";
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

type Tab = "partidos" | "tabla" | "goleadores";

export default function Tournament() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const [activeTab, setActiveTab] = useState<Tab>("partidos");

  const { data: tournament, isLoading: loadingTournament } = useGetTournamentBySlug(slug, {
    query: { queryKey: getGetTournamentBySlugQueryKey(slug), enabled: !!slug },
  });

  const tournamentId = tournament?.id ?? 0;

  const { data: fixturesData, isLoading: loadingFixtures } = useGetTournamentFixtures(
    tournamentId,
    {},
    { query: { queryKey: getGetTournamentFixturesQueryKey(tournamentId, {}), enabled: !!tournamentId && activeTab === "partidos" } }
  );

  const { data: standingsData, isLoading: loadingStandings } = useGetTournamentStandings(
    tournamentId,
    { query: { queryKey: getGetTournamentStandingsQueryKey(tournamentId), enabled: !!tournamentId && activeTab === "tabla" } }
  );

  const { data: scorersData, isLoading: loadingScorers } = useGetTournamentScorers(
    tournamentId,
    { query: { queryKey: getGetTournamentScorersQueryKey(tournamentId), enabled: !!tournamentId && activeTab === "goleadores" } }
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "partidos", label: "Partidos", icon: <Calendar className="w-4 h-4" /> },
    { id: "tabla", label: "Tabla", icon: <Trophy className="w-4 h-4" /> },
    { id: "goleadores", label: "Goleadores", icon: <Target className="w-4 h-4" /> },
  ];

  if (loadingTournament) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Torneo no encontrado.</p>
        <Link href="/" className="text-[#1a9be6] mt-4 inline-block hover:underline">← Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Banner */}
      <div className="bg-[#1e1e1e] overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-[#1a9be6] via-blue-700 to-blue-900 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>
        <div className="px-6 py-4 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 -mt-10">
            <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-lg border border-gray-200 text-2xl">
              {tournament.flagEmoji ?? "🏆"}
            </div>
            <div className="pt-8">
              <h1 className="text-xl font-bold text-white">{tournament.name}</h1>
              <p className="text-sm text-gray-400 capitalize">{tournament.category === "argentina" ? "Argentina" : tournament.category === "destacados" ? "Destacado" : "Internacional"}</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm pb-2 sm:pb-0">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-[60px] z-30">
        <div className="flex px-6 gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#1a9be6] text-[#1a9be6]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-4">
        {activeTab === "partidos" && (
          <>
            {loadingFixtures ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
              </div>
            ) : fixturesData?.groups[0]?.matches.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
                No hay partidos registrados para este torneo.
              </div>
            ) : (
              fixturesData?.groups.map((group) => (
                <MatchGroupCard key={group.tournament.id} group={group} showLink={false} />
              ))
            )}
          </>
        )}

        {activeTab === "tabla" && (
          <>
            {loadingStandings ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : !standingsData?.standings.length ? (
              <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
                No hay tabla de posiciones disponible.
              </div>
            ) : (
              <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f8f8f8] border-b text-gray-500 text-xs uppercase">
                      <th className="px-4 py-3 text-left w-8">#</th>
                      <th className="px-4 py-3 text-left">Equipo</th>
                      <th className="px-3 py-3 text-center w-10">PJ</th>
                      <th className="px-3 py-3 text-center w-10">G</th>
                      <th className="px-3 py-3 text-center w-10">E</th>
                      <th className="px-3 py-3 text-center w-10">P</th>
                      <th className="px-3 py-3 text-center w-12">GF</th>
                      <th className="px-3 py-3 text-center w-12">GC</th>
                      <th className="px-3 py-3 text-center w-12">DG</th>
                      <th className="px-3 py-3 text-center w-12 font-bold text-gray-800">Pts</th>
                      <th className="px-4 py-3 text-center hidden md:table-cell">Forma</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {standingsData.standings.map((row, idx) => (
                      <tr key={row.team.id} className={`hover:bg-gray-50 transition-colors ${idx < 4 ? "border-l-2 border-l-[#1a9be6]" : idx < 6 ? "border-l-2 border-l-amber-400" : ""}`}>
                        <td className="px-4 py-3 text-gray-400 font-medium">{row.position}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                              {row.team.logoUrl
                                ? <img src={row.team.logoUrl} className="w-5 h-5 object-contain" alt="" />
                                : row.team.name.charAt(0)
                              }
                            </div>
                            <span className="font-medium text-gray-900">{row.team.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600">{row.played}</td>
                        <td className="px-3 py-3 text-center text-gray-600">{row.won}</td>
                        <td className="px-3 py-3 text-center text-gray-600">{row.drawn}</td>
                        <td className="px-3 py-3 text-center text-gray-600">{row.lost}</td>
                        <td className="px-3 py-3 text-center text-gray-600">{row.goalsFor}</td>
                        <td className="px-3 py-3 text-center text-gray-600">{row.goalsAgainst}</td>
                        <td className="px-3 py-3 text-center text-gray-600">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                        <td className="px-3 py-3 text-center font-bold text-gray-900">{row.points}</td>
                        <td className="px-4 py-3 text-center hidden md:table-cell">
                          {row.form && (
                            <div className="flex items-center justify-center gap-0.5">
                              {row.form.split("").map((r, i) => (
                                <span key={i} className={`w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-bold ${r === "W" ? "bg-green-500" : r === "D" ? "bg-amber-400" : "bg-red-500"}`}>{r === "W" ? "G" : r === "D" ? "E" : "P"}</span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 bg-[#f8f8f8] border-t flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-4 bg-[#1a9be6] rounded-sm inline-block" /> Clasificación</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-4 bg-amber-400 rounded-sm inline-block" /> Playoff</span>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "goleadores" && (
          <>
            {loadingScorers ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : !scorersData?.scorers.length ? (
              <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
                No hay datos de goleadores disponibles.
              </div>
            ) : (
              <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f8f8f8] border-b text-gray-500 text-xs uppercase">
                      <th className="px-4 py-3 text-left w-8">#</th>
                      <th className="px-4 py-3 text-left">Jugador</th>
                      <th className="px-4 py-3 text-left hidden sm:table-cell">Equipo</th>
                      <th className="px-3 py-3 text-center w-16">PJ</th>
                      <th className="px-3 py-3 text-center w-16">Asist.</th>
                      <th className="px-3 py-3 text-center w-16 font-bold text-gray-800">Goles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {scorersData.scorers.map((entry) => (
                      <tr key={entry.player.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 font-medium">{entry.position}</td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{entry.player.name}</div>
                            {entry.player.nationality && <div className="text-xs text-gray-400">{entry.player.nationality}</div>}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                              {entry.team.name.charAt(0)}
                            </div>
                            <span className="text-gray-600 text-xs">{entry.team.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center text-gray-600">{entry.played}</td>
                        <td className="px-3 py-3 text-center text-gray-600">{entry.assists}</td>
                        <td className="px-3 py-3 text-center font-bold text-gray-900 text-base">{entry.goals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
