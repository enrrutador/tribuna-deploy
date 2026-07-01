import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
const { t } = useTranslation();
  return <div className={cn("shimmer rounded-lg", className)} {...props} />;
}

/** Full-row skeleton for match lists. */
export function MatchRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-12 rounded-md" />
    </div>
  );
}

/** Card skeleton block. */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass rounded-2xl p-5 space-y-3", className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
