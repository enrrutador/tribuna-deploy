import { Github, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[var(--color-carbon)]/40 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--color-slate-500)]">
          <span className="text-gradient-lime font-bold">Tribuna</span>
          <span>·</span>
          <span>Fútbol en vivo</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            Hecho con <Heart size={12} className="text-[var(--color-magenta-500)]" /> en Argentina
          </span>
        </div>
        <div className="flex items-center gap-4 text-[var(--color-slate-500)]">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-lime-400)] transition-colors"
          >
            <Github size={16} />
          </a>
          <span className="text-xs">
            Datos: ESPN API Pública · {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
