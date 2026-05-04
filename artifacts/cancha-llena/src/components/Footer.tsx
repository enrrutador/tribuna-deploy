import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-400 mt-8">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Logo + descripción */}
          <div className="max-w-xs">
            <div className="mb-3">
              <span className="text-white text-xl tracking-tighter font-light">cancha</span>
              <span className="text-[#1a9be6] text-xl font-bold tracking-tighter">lleña</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              canchallena es el sitio de referencia para resultados deportivos en tiempo real: datos en vivo, tablas, probabilidades y detalles de las competiciones de fútbol más importantes.
            </p>
          </div>

          {/* Competencias */}
          <div>
            <h4 className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-3">Competencias</h4>
            <ul className="space-y-2 text-sm">
              {["Champions League", "Copa Libertadores", "Premier League", "La Liga", "Serie A"].map((c) => (
                <li key={c}>
                  <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Argentina */}
          <div>
            <h4 className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-3">Argentina</h4>
            <ul className="space-y-2 text-sm">
              {["Torneo Apertura", "Torneo Clausura", "Copa Argentina", "Primera Nacional", "Liga Profesional"].map((c) => (
                <li key={c}>
                  <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* App */}
          <div>
            <h4 className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-3">Nuestra App</h4>
            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <span className="hover:text-gray-300 cursor-pointer transition-colors">App Store</span>
              <span className="hover:text-gray-300 cursor-pointer transition-colors">Google Play</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-600">
          <span>Copyright 2026 SA LA NACION | Todos los derechos reservados.</span>
          <span className="hover:text-gray-400 cursor-pointer transition-colors">¿Cómo anunciar?</span>
        </div>
      </div>
    </footer>
  );
}
