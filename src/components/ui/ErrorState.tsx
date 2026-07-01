import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "./Button";
import { useTranslation } from "@/lib/i18n";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  icon?: ReactNode;
}

export function ErrorState({
  title = "Algo salió mal",
  description = "No pudimos cargar los datos. Revisá tu conexión e intentá de nuevo.",
  onRetry,
  icon,
}: ErrorStateProps) {
const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-magenta-500)]/12 text-[var(--color-magenta-400)]">
        {icon ?? <AlertTriangle size={28} />}
      </div>
      <h3 className="text-lg font-bold text-[var(--color-slate-100)]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--color-slate-400)]">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RotateCw size={14} />
          Reintentar
        </Button>
      )}
    </motion.div>
  );
}
