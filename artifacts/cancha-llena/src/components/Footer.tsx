import { Link } from "wouter";

const COMPETENCIAS = [
  { name: "Champions League", slug: "champions" },
  { name: "Copa Libertadores", slug: "libertadores" },
  { name: "Premier League", slug: "premier-league" },
  { name: "La Liga", slug: "laliga" },
  { name: "Serie A", slug: "seriea" },
];

const ARGENTINA = [
  { name: "Liga Profesional", slug: "liga-profesional" },
  { name: "Copa Argentina", slug: "copa-argentina" },
  { name: "Primera Nacional", slug: "primera-nacional" },
  { name: "Copa de la Liga", slug: "copa-de-la-liga" },
  { name: "Trofeo de Campeones", slug: "trofeo-de-campeones" },
];

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
              Cancha Llena es el sitio de referencia para resultados deportivos en tiempo real: datos en vivo, tablas, probabilidades y detalles de las competiciones de fútbol más importantes.
            </p>
          </div>

          {/* Competencias */}
          <div>
            <h4 className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-3">Competencias</h4>
            <ul className="space-y-2 text-sm">
              {COMPETENCIAS.map((c) => (
                <li key={c.slug}>
                  <Link href={`/torneo/${c.slug}`} className="text-gray-500 hover:text-gray-300 transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Argentina */}
          <div>
            <h4 className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-3">Argentina</h4>
            <ul className="space-y-2 text-sm">
              {ARGENTINA.map((c) => (
                <li key={c.slug}>
                  <Link href={`/torneo/${c.slug}`} className="text-gray-500 hover:text-gray-300 transition-colors">
                    {c.name}
                  </Link>
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
