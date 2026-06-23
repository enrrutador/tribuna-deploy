import { useGetTournamentFixtures, getGetTournamentFixturesQueryKey, useGetNews, getGetNewsQueryKey } from "@workspace/api-client-react";
import { format as dateFnsFormat } from "date-fns";

const WC_LEAGUE_ID = "fifa.world" as any;

export default function WorldCupNewsSidebar() {
  const today = new Date();
  const fourDaysAgo = new Date(today);
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
  const fromDate = dateFnsFormat(fourDaysAgo, "yyyyMMdd");
  const toDate = dateFnsFormat(today, "yyyyMMdd");

  const { data: wcData } = useGetTournamentFixtures(WC_LEAGUE_ID, { dates: `${fromDate}-${toDate}` }, {
    query: {
      queryKey: getGetTournamentFixturesQueryKey(WC_LEAGUE_ID, { dates: `${fromDate}-${toDate}` }),
      staleTime: 5 * 60_000,
    },
  });

  const { data: newsData, isLoading: newsLoading } = useGetNews(undefined, {
    query: {
      queryKey: getGetNewsQueryKey(),
      staleTime: 5 * 60_000,
    },
  });

  const wcMatches = (wcData?.groups ?? []).flatMap((g: any) => g.matches ?? []);
  const teamNames = [...new Set(
    wcMatches.flatMap((m: any) => [
      m.homeTeam?.name ?? "",
      m.awayTeam?.name ?? "",
    ]).filter(Boolean)
  )] as string[];

  const wcKeywords = ["mundial", "world cup", "copa mundial", "qatar", "fifa", ...teamNames.map((n) => n.toLowerCase())];
  const allNews = (newsData?.articles ?? []) as any[];
  const wcNews = allNews.filter((article: any) => {
    const text = `${article.title ?? ""} ${article.summary ?? ""}`.toLowerCase();
    return wcKeywords.some((kw) => text.includes(kw.toLowerCase()));
  }).slice(0, 8);

  if (newsLoading) {
    return (
      <aside className="w-[300px] shrink-0 space-y-3 hidden lg:block">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🌍</span>
            <span className="font-bold text-gray-800 text-sm">Noticias Mundial</span>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 mb-3 last:mb-0">
              <div className="w-16 h-16 rounded-xl bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  if (wcNews.length === 0) return null;

  return (
    <aside className="w-[300px] shrink-0 hidden lg:block">
      <div className="lg:sticky lg:top-24 space-y-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🌍</span>
            <span className="font-bold text-gray-800 text-sm">Noticias Mundial</span>
          </div>
          <div className="space-y-3">
            {wcNews.map((article: any, idx: number) => (
              <a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 group"
              >
                {article.imageUrl && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img src={article.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800 line-clamp-2 group-hover:text-[#1a9be6] transition-colors">
                    {article.title}
                  </p>
                  {article.summary && (
                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{article.summary}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
