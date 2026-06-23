import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, X, User, Shield, Trophy } from "lucide-react";

interface SearchResult {
  players: Array<{
    id: number;
    name: string;
    position: string;
    nationality: string;
    imageUrl?: string | null;
    team?: { id: number; name: string } | null;
  }>;
  teams: Array<{
    id: number;
    name: string;
    shortName?: string | null;
    logoUrl?: string | null;
    slug?: string | null;
  }>;
  leagues: Array<{
    id: string;
    name: string;
    slug?: string | null;
    flagEmoji?: string | null;
  }>;
}

export default function Header() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/?q=${encodeURIComponent(value.trim())}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch {
        setResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelect = (path: string) => {
    setQuery("");
    setResults(null);
    setIsOpen(false);
    navigate(path);
  };

  const totalResults = results
    ? results.players.length + results.teams.length + results.leagues.length
    : 0;

  return (
    <header className="w-full shrink-0 sticky top-0 z-50 flex flex-col">
      {/* Top hex band */}
      <div className="h-[22px] w-full hex-pattern" />
      {/* Logo row */}
      <div className="h-[56px] w-full bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-6 gap-4">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity select-none shrink-0">
          <span className="text-white text-[22px] font-light tracking-[-0.5px]" style={{ fontFamily: "'Arial', 'Helvetica Neue', sans-serif" }}>cancha</span>
          <span className="text-white text-[22px] font-black tracking-[-0.5px]" style={{ fontFamily: "'Arial', 'Helvetica Neue', sans-serif" }}>lle</span>
          <span className="text-white text-[22px] font-black tracking-[-0.5px]" style={{ fontFamily: "'Arial', 'Helvetica Neue', sans-serif" }}>ña</span>
        </Link>

        {/* Search bar */}
        <div className="relative flex-1 max-w-md ml-4" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => results && setIsOpen(true)}
              placeholder="Buscar jugadores, equipos..."
              className="w-full bg-[#2a2a2a] text-white text-[13px] pl-9 pr-8 py-2 rounded-sm border border-[#3a3a3a] focus:border-[#1a9be6] focus:outline-none placeholder-gray-500 transition-colors"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setResults(null); setIsOpen(false); inputRef.current?.focus(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {isOpen && results && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e1e] border border-[#3a3a3a] rounded-sm shadow-xl max-h-[400px] overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500 text-[13px]">Buscando...</div>
              ) : totalResults === 0 ? (
                <div className="p-4 text-center text-gray-500 text-[13px]">No se encontraron resultados</div>
              ) : (
                <>
                  {results.players.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-[#252525]">Jugadores</div>
                      {results.players.slice(0, 5).map((p) => (
                        <button
                          key={`p-${p.id}`}
                          onClick={() => handleSelect(p.team ? `/equipo/${p.team.id}` : "/")}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#2a2a2a] transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center overflow-hidden shrink-0">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] text-white font-medium truncate">{p.name}</div>
                            <div className="text-[11px] text-gray-500">{p.position} · {p.nationality}{p.team ? ` · ${p.team.name}` : ""}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.teams.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-[#252525]">Equipos</div>
                      {results.teams.slice(0, 5).map((t) => (
                        <button
                          key={`t-${t.id}`}
                          onClick={() => handleSelect(`/equipo/${t.id}`)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#2a2a2a] transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center overflow-hidden shrink-0">
                            {t.logoUrl ? (
                              <img src={t.logoUrl} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <Shield className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] text-white font-medium truncate">{t.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.leagues.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-[#252525]">Ligas</div>
                      {results.leagues.slice(0, 5).map((l) => (
                        <button
                          key={`l-${l.id}`}
                          onClick={() => handleSelect(`/torneo/${l.slug ?? l.id}`)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#2a2a2a] transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-lg shrink-0">
                            {l.flagEmoji ?? "⚽"}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] text-white font-medium truncate">{l.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
