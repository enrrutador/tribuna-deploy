import { cn } from "@/lib/utils";
import { getTeamColors } from "@/lib/teamColors";
import type { TeamRef } from "@/lib/types";

interface TeamBadgeProps {
  team: Pick<TeamRef, "name" | "shortName" | "logoUrl">;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "h-6 w-6 text-[8px]",
  sm: "h-8 w-8 text-[10px]",
  md: "h-11 w-11 text-xs",
  lg: "h-14 w-14 text-sm",
  xl: "h-20 w-20 text-lg",
};

export function TeamBadge({ team, size = "md", className }: TeamBadgeProps) {
  const colors = getTeamColors(team.name);
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-black ring-1 ring-white/10",
        sizes[size],
        className
      )}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {team.logoUrl ? (
        <img
          src={team.logoUrl}
          alt={team.name}
          loading="lazy"
          className="h-full w-full object-contain p-0.5"
          width="100" height="100"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        (team.shortName ?? team.name).slice(0, 3).toUpperCase()
      )}
    </div>
  );
}
