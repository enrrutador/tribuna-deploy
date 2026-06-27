import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <Loader2
      style={{ width: size, height: size }}
      className={cn("animate-spin text-[var(--color-lime-400)]", className)}
    />
  );
}
