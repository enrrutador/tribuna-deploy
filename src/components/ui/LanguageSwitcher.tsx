import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import { useTranslation, LANG_FLAGS, LANG_NAMES, LANGUAGES, type Lang } from "@/lib/i18n";

const COLORS: Record<Lang, string> = {
  es: "#ff4b4b",
  en: "#4b8bff",
  pt: "#2ed47a",
  it: "#4bcf7b",
  de: "#ffc107",
  fr: "#6c5ce7",
  nl: "#ff6b35",
  zh: "#e74c3c",
};

export default function LanguageSwitcher() {
  const { t, lang, setLang } = useTranslation();
  const [open, setOpen] = useState(false);
  const [rotate, setRotate] = useState(0);
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
        onClick={() => { setOpen(!open); setRotate((r) => r + 360); }}
        className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.03] text-[var(--color-slate-400)] shadow-lg shadow-black/10 transition-all hover:bg-white/10 hover:text-[var(--color-slate-200)] hover:shadow-lime-500/20 active:scale-95"
        aria-label={t("Cambiar idioma")}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-lime-500/0 via-transparent to-lime-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
        <motion.div
          animate={{ rotate }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ color: lang === "es" ? undefined : COLORS[lang] }}
        >
          <Globe size={22} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.92 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--color-carbon)]/90 backdrop-blur-2xl shadow-2xl z-50"
          >
            <div className="p-1.5">
              {LANGUAGES.map((l, i) => (
                <motion.button
                  key={l}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.15 }}
                  onClick={() => { setLang(l); setOpen(false); setRotate((r) => r + 90); }}
                  className={`relative flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                    lang === l
                      ? "bg-gradient-to-r from-lime-500/15 to-emerald-500/10 text-lime-300 shadow-sm shadow-lime-500/10"
                      : "text-[var(--color-slate-400)] hover:bg-white/[0.06] hover:text-white hover:shadow-sm"
                  }`}
                >
                  {lang === l && (
                    <motion.div
                      layoutId="lang-bg"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-lime-500/15 to-emerald-500/10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative text-lg drop-shadow-sm">{LANG_FLAGS[l]}</span>
                  <span className="relative">{LANG_NAMES[l]}</span>
                  {lang === l && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-lime-500/20 text-[10px] text-lime-400"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
