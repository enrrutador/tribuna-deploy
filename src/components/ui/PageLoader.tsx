import { motion } from "framer-motion";
import { Spinner } from "./Spinner";

export function PageLoader({ label = "Cargando" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="relative h-16 w-16"
      >
        <div className="absolute inset-0 rounded-full border-2 border-[var(--color-lime-500)]/20" />
        <div className="absolute inset-0 rounded-full border-t-2 border-[var(--color-lime-500)] shadow-[0_0_18px_var(--color-lime-glow)]" />
      </motion.div>
      <p className="flex items-center gap-2 text-sm text-[var(--color-slate-400)]">
        <Spinner size={14} />
        {label}…
      </p>
    </div>
  );
}
