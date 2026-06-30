import { Link } from "wouter";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import TournamentList from "@/components/domain/TournamentList";

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/5 bg-[var(--color-carbon)]/60 backdrop-blur-sm">
      <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-3">
        {/* Live shortcut */}
        <Link href="/live">
          <motion.div
            whileHover={{ x: 3 }}
            className="mb-3 flex items-center gap-2.5 rounded-xl bg-[var(--color-live)]/8 border border-[var(--color-live)]/15 px-3 py-2.5 text-sm font-semibold text-[var(--color-live)] transition-all hover:bg-[var(--color-live)]/15"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-live)] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-live)]" />
            </span>
            En Vivo
          </motion.div>
        </Link>

        {/* Trending shortcut */}
        <Link href="/tendencias">
          <motion.div
            whileHover={{ x: 3 }}
            className="mb-3 flex items-center gap-2.5 rounded-xl bg-lime-400/8 border border-lime-400/15 px-3 py-2.5 text-sm font-semibold text-lime-400 transition-all hover:bg-lime-400/15"
          >
            <TrendingUp className="h-4 w-4" />
            Tendencias
          </motion.div>
        </Link>

        {/* All leagues — shared with the LeaguesDrawer */}
        <TournamentList />
      </div>
    </aside>
  );
}
