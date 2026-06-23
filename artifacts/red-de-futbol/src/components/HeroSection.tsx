import { Zap } from "lucide-react";

interface Props {
  liveCount: number;
}

export default function HeroSection({ liveCount }: Props) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-6 md:p-8">
      <div className="absolute inset-0 opacity-20 hex-pattern" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#1a9be6] animate-pulse" />
          <span className="font-mono text-[10px] text-[#1a9be6] font-bold uppercase tracking-widest">
            Red de Fútbol
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-black tracking-tight leading-tight">
              Fútbol en Vivo
            </h1>
            <p className="text-gray-400 text-sm mt-2 max-w-md">
              Resultados en tiempo real, estadísticas y noticias del fútbol argentino y mundial.
            </p>
          </div>
          {liveCount > 0 && (
            <div className="flex items-center gap-2 bg-[#e53935]/20 border border-[#e53935]/30 rounded-xl px-4 py-2.5">
              <Zap className="w-4 h-4 text-[#e53935]" fill="currentColor" />
              <span className="text-[#e53935] font-bold text-sm">
                {liveCount} {liveCount === 1 ? "partido" : "partidos"} en vivo
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
