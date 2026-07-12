import { Link } from "wouter";
import { Trophy, Globe2, Flag } from "lucide-react";
import { useTournaments } from "@/lib/hooks";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageLoader } from "@/components/ui/PageLoader";
import { Badge } from "@/components/ui/Badge";
import type { CategoryId } from "@/lib/types";
import { useTranslation } from "@/lib/i18n";

const CATEGORY_META: { id: CategoryId; label: string; icon: string; accent: string }[] = [
  { id: "destacados", label: "Destacados", icon: "⭐", accent: "lime" },
  { id: "argentina", label: "Argentina", icon: "🇦🇷", accent: "cyan" },
  { id: "sudamerica", label: "Sudamérica", icon: "🌎", accent: "magenta" },
  { id: "world", label: "Mundo", icon: "🌍", accent: "cyan" },
];

const ACCENTS: Record<string, string> = {
  lime: "text-[var(--color-lime-400)]",
  cyan: "text-[var(--color-cyan-400)]",
  magenta: "text-[var(--color-magenta-400)]",
};

export default function Tournaments() {
  const { t } = useTranslation();
  const { data: tournaments, isLoading } = useTournaments();

  if (isLoading) return <PageLoader label="Cargando torneos" />;

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={<Trophy size={20} />}
        title="Todos los torneos"
        subtitle="Explorá ligas y copas del mundo"
        accent="lime"
      />

      <div className="space-y-7">
        {CATEGORY_META.map((cat) => {
          const items = tournaments?.[cat.id] ?? [];
          if (items.length === 0) return null;

          return (
            <div key={cat.id}>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                <h2 className={`text-sm font-black uppercase tracking-wider ${ACCENTS[cat.accent]}`}>
                  {cat.label}
                </h2>
                <Badge tone="default" className="text-[9px]">{items.length}</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((t, i) => (
                  <div
                    key={t.slug}
                    className="animate-page-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <Link href={`/tournament/${t.slug}`}>
                      <GlassCard variant="soft" hover className="flex items-center gap-3 px-4 py-3.5 h-full">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-2xl ring-1 ring-white/5">
                          {t.flag}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[var(--color-slate-100)] truncate group-hover:text-[var(--color-lime-400)]">
                            {t.name}
                          </p>
                          <p className="text-[11px] text-[var(--color-slate-500)] flex items-center gap-1">
                            <Flag size={10} />
                            {t.country}
                          </p>
                        </div>
                      </GlassCard>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}