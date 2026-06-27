import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard variant="strong" className="p-10 text-center max-w-md">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-7xl mb-4"
          >
            ⚽
          </motion.div>
          <h1 className="text-4xl font-black text-gradient-lime mb-2">404</h1>
          <p className="text-[var(--color-slate-400)] mb-6">
            Esta página no existe o fue removida. El partido quizás ya terminó y el link cambió.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/">
              <Button variant="primary">
                <Home size={16} />
                Ir al inicio
              </Button>
            </Link>
            <Button variant="ghost" onClick={() => history.back()}>
              <ArrowLeft size={16} />
              Volver
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
