import React from "react";
import { Link } from "wouter";

export default function Header() {
  return (
    <header className="h-[60px] w-full flex items-center px-6 border-b border-[#333] shrink-0 hex-pattern sticky top-0 z-50">
      <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
        <span className="text-white text-2xl tracking-tighter">cancha</span>
        <span className="text-[#1a9be6] text-2xl font-bold tracking-tighter">lleña</span>
      </Link>
    </header>
  );
}
