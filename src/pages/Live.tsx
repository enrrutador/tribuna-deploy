import { motion } from "framer-motion";
import { Radio, RefreshCw } from "lucide-react";
import { useLiveMatches } from "@/lib/hooks";
import { timeAgo } from "@/lib/utils";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import MatchGroupCard from "@/components/domain/MatchGroupCard";
import { useTranslation } from "@/lib/i18n";

export default function Live() {
const { t } = useTranslation();
  const {
    data: liveData,
    isLoading,
    isFetching,
    dataUpdatedAt,
    refetch,
    error,
  } = useLiveMatches();

  const groups = liveData?.groups ?? [];
  const total = liveData?.totalMatches ?? 0;

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={<Radio size={20} />}
        title="En Vivo"
        subtitle={total > 0 ? `${total} partido${total !== 1 ? "s" : ""} en juego ahora` : undefined}
        action={
          <div className="flex items-center gap-2">
            {dataUpdatedAt && !isLoading && (
              <span className="text-[11px] text-[var(--color-slate-500)]">
                {isFetching ? (
                  <span className="flex items-center gap-1 text-[var(--color-live)]">
                    <RefreshCw size={10} className="animate-spin" /> Live
                  </span>
                ) : (
                  `Act. ${timeAgo(dataUpdatedAt)}`
                )}
              </span>
            )}
            <Button variant="live" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} />
              Refrescar
            </Button>
          </div>
        }
      />

      {error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon="😴"
          title="Nada en vivo ahora"
          description="No hay partidos jugándose en este momento. Volvé más tarde o explorá los resultados del día."
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {groups.map((group, i) => (
            <MatchGroupCard key={group.tournament.id} group={group} index={i} glow="magenta" />
          ))}
        </motion.div>
      )}
    </div>
  );
}
