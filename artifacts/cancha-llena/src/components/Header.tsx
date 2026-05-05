import { Link } from "wouter";

export default function Header() {
  return (
    <header className="w-full shrink-0 sticky top-0 z-50 flex flex-col">
      {/* Top hex band */}
      <div className="h-[22px] w-full hex-pattern" />
      {/* Logo row */}
      <div className="h-[56px] w-full bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-6">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity select-none">
          <span className="text-white text-[22px] font-light tracking-[-0.5px]" style={{ fontFamily: "'Arial', 'Helvetica Neue', sans-serif" }}>cancha</span>
          <span className="text-white text-[22px] font-black tracking-[-0.5px]" style={{ fontFamily: "'Arial', 'Helvetica Neue', sans-serif" }}>lle</span>
          <span className="text-white text-[22px] font-black tracking-[-0.5px]" style={{ fontFamily: "'Arial', 'Helvetica Neue', sans-serif" }}>ña</span>
        </Link>
      </div>
    </header>
  );
}
