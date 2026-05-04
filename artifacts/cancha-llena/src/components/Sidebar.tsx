import React from "react";
import { useListTournaments, getListTournamentsQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "./ui/skeleton";

export default function Sidebar() {
  const { data: tournamentsData, isLoading } = useListTournaments({
    query: { queryKey: getListTournamentsQueryKey() }
  });

  return (
    <aside className="w-[260px] bg-[#1e1e1e] h-full flex flex-col overflow-y-auto hidden md:flex shrink-0">
      <div className="p-4 space-y-8">
        {isLoading ? (
          <div className="space-y-6">
            <div>
              <Skeleton className="h-4 w-24 bg-[#333] mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 w-full bg-[#2a2a2a]" />)}
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-24 bg-[#333] mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 w-full bg-[#2a2a2a]" />)}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-[#888] text-xs font-bold uppercase tracking-wider mb-3 px-2">
                Destacados
              </h3>
              <ul className="space-y-1">
                {tournamentsData?.destacados?.map((tournament) => (
                  <li key={tournament.id}>
                    <button className="w-full flex items-center gap-3 px-2 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors group">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {tournament.logoUrl ? (
                          <img src={tournament.logoUrl} alt="" className="w-4 h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                        ) : tournament.flagEmoji ? (
                          <span>{tournament.flagEmoji}</span>
                        ) : (
                          <div className="w-4 h-4 bg-[#333] rounded-sm" />
                        )}
                      </div>
                      <span className="truncate text-left font-medium">{tournament.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[#888] text-xs font-bold uppercase tracking-wider mb-3 px-2">
                Argentina
              </h3>
              <ul className="space-y-1">
                {tournamentsData?.argentina?.map((tournament) => (
                  <li key={tournament.id}>
                    <button className="w-full flex items-center gap-3 px-2 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors group">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {tournament.logoUrl ? (
                          <img src={tournament.logoUrl} alt="" className="w-4 h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                        ) : tournament.flagEmoji ? (
                          <span>{tournament.flagEmoji}</span>
                        ) : (
                          <div className="w-4 h-4 bg-[#333] rounded-sm" />
                        )}
                      </div>
                      <span className="truncate text-left font-medium">{tournament.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-[#888] text-xs font-bold uppercase tracking-wider mb-3 px-2">
                Resto del Mundo
              </h3>
              <ul className="space-y-1">
                {tournamentsData?.world?.map((tournament) => (
                  <li key={tournament.id}>
                    <button className="w-full flex items-center gap-3 px-2 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors group">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {tournament.logoUrl ? (
                          <img src={tournament.logoUrl} alt="" className="w-4 h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                        ) : tournament.flagEmoji ? (
                          <span>{tournament.flagEmoji}</span>
                        ) : (
                          <div className="w-4 h-4 bg-[#333] rounded-sm" />
                        )}
                      </div>
                      <span className="truncate text-left font-medium">{tournament.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
