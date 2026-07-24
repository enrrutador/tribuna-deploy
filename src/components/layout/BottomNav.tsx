import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Activity, Radio, Star, Trophy, Search, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveMatches } from "@/lib/hooks";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n";

export default function BottomNav() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { data: liveData } = useLiveMatches();
  const liveCount = liveData?.totalMatches ?? 0;

  const items = [
    { href: "/", label: t("Inicio"), icon: Activity },
    { href: "/live", label: t("Vivo"), icon: Radio },
    { href: "/tendencias", label: t("Tendencias"), icon: TrendingUp },
    { href: "/favorites", label: t("Favoritos"), icon: Star },
    { href: "/tournaments", label: t("Torneos"), icon: Trophy },
  ];

  return (
    <nav className="safe-bottom glass-strong fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors",
                  isActive
                    ? "text-[var(--color-lime-400)]"
                    : "text-[var(--color-slate-500)]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav"
                    className="absolute -top-1 h-0.5 w-8 rounded-full bg-[var(--color-lime-500)] shadow-[0_0_12px_var(--color-lime-glow)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative">
                  <Icon size={20} />
                  {item.href === "/live" && liveCount > 0 && (
                    <Badge tone="live" pulse className="absolute -top-1.5 -right-2.5 text-[8px] px-1 py-0">
                      {liveCount}
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
