import React from "react";
import { Link, useLocation } from "wouter";
import { useListTournaments, getListTournamentsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "./ui/skeleton";
import { Home } from "lucide-react";

type Tournament = { id: number; name: string; slug: string; logoUrl?: string | null; flagEmoji?: string | null };

function TournamentItem({ tournament }: { tournament: Tournament }) {
  const [location] = useLocation();
  const isActive = location === `/torneo/${tournament.slug}`;

  return (
    <li>
      <Link href={`/torneo/${tournament.slug}`}>
        <div className={`w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md transition-colors group cursor-pointer ${
          isActive ? "bg-[#1a9be6]/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}>
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            {tournament.logoUrl ? (
              <img src={tournament.logoUrl} alt="" className={`w-4 h-4 object-contain transition-opacity ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`} />
            ) : tournament.flagEmoji ? (
              <span className="leading-none">{tournament.flagEmoji}</span>
            ) : (
              <div className="w-4 h-4 bg-[#333] rounded-sm" />
            )}
          </div>
          <span className={`truncate text-left font-medium ${isActive ? "text-white" : ""}`}>{tournament.name}</span>
          {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1a9be6] shrink-0" />}
        </div>
      </Link>
    </li>
  );
}

function SectionSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-20 bg-[#333] mb-3 mx-2" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 w-full bg-[#2a2a2a] rounded-md" />)}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const { data: tournamentsData, isLoading } = useListTournaments({
    query: { queryKey: getListTournamentsQueryKey() }
  });

  return (
    <aside className="w-[230px] bg-[#1a1a1a] h-full flex flex-col overflow-y-auto hidden md:flex shrink-0 border-r border-[#2a2a2a]">
      {/* Home link */}
      <div className="p-3 border-b border-[#2a2a2a]">
        <Link href="/">
          <div className={`flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer transition-colors ${location === "/" ? "bg-[#1a9be6]/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
            <Home className="w-4 h-4 shrink-0" />
            <span className="text-sm font-bold">Todos los partidos</span>
            {location === "/" && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1a9be6] shrink-0" />}
          </div>
        </Link>
      </div>

      <div className="p-3 space-y-6 flex-1">
        {isLoading ? (
          <div className="space-y-6">
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-[#666] text-[10px] font-bold uppercase tracking-widest mb-2 px-2">
                Destacados
              </h3>
              <ul className="space-y-0.5">
                {tournamentsData?.destacados?.map((t) => <TournamentItem key={t.id} tournament={t} />)}
              </ul>
            </div>

            <div>
              <h3 className="text-[#666] text-[10px] font-bold uppercase tracking-widest mb-2 px-2">
                Argentina
              </h3>
              <ul className="space-y-0.5">
                {tournamentsData?.argentina?.map((t) => <TournamentItem key={t.id} tournament={t} />)}
              </ul>
            </div>

            <div>
              <h3 className="text-[#666] text-[10px] font-bold uppercase tracking-widest mb-2 px-2">
                Resto del Mundo
              </h3>
              <ul className="space-y-0.5">
                {tournamentsData?.world?.map((t) => <TournamentItem key={t.id} tournament={t} />)}
              </ul>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
