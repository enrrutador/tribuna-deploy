import { useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface TabsProps {
  tabs: { id: string; label: string; icon?: ReactNode; content: ReactNode }[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTab, className }: TabsProps) {
const { t } = useTranslation();
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? "");
  const current = tabs.find((t) => t.id === active);

  return (
    <div className={className}>
      {/* Tab bar */}
      <div className="glass inline-flex gap-1 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              active === tab.id
                ? "text-[var(--color-void)]"
                : "text-[var(--color-slate-400)] hover:text-[var(--color-slate-200)]"
            )}
          >
            {active === tab.id && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 rounded-lg bg-[var(--color-lime-500)] shadow-[0_0_18px_var(--color-lime-glow)]"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content with animated transitions */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {current?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
