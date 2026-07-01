import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import { useTranslation, LANG_FLAGS, LANG_NAMES, LANGUAGES, type Lang } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-slate-400)] transition-all hover:bg-white/5 hover:text-[var(--color-slate-200)]"
        aria-label="Cambiar idioma"
      >
        <Globe size={18} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1 w-44 origin-top-right overflow-hidden rounded-xl border border-white/10 bg-[var(--color-carbon)]/95 backdrop-blur-xl shadow-2xl z-50"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => { setLang(l); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  lang === l
                    ? "bg-lime-500/10 text-lime-400"
                    : "text-[var(--color-slate-300)] hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-base">{LANG_FLAGS[l]}</span>
                <span className="font-medium">{LANG_NAMES[l]}</span>
                {lang === l && (
                  <span className="ml-auto text-[10px] text-lime-400">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
