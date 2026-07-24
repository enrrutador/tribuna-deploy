import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy } from "lucide-react";
import TournamentList from "@/components/domain/TournamentList";
import { useTranslation } from "@/lib/i18n";

interface LeaguesDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Slide-in overlay with the full leagues list (same compact list as the
 * persistent Sidebar). Closes on: Escape, backdrop click, and route change.
 * Locks body scroll while open.
 */
export default function LeaguesDrawer({ open, onClose }: LeaguesDrawerProps) {
const { t } = useTranslation();
  const [location] = useLocation();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while the drawer is mounted
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close when the route changes (user picked a league)
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="glass-strong fixed inset-y-0 left-0 z-50 flex w-[300px] max-w-[85vw] flex-col border-r border-white/10"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-lime-500)]/15">
                  <Trophy size={15} className="text-[var(--color-lime-400)]" />
                </span>
                <h2 className="text-sm font-black uppercase tracking-wider text-[var(--color-slate-100)]">
                  Torneos
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-slate-400)] transition-colors hover:bg-white/5 hover:text-[var(--color-slate-100)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* League list */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4">
              <TournamentList onNavigate={onClose} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
