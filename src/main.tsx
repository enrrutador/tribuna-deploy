import { StrictMode, Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from "@/lib/i18n";
import App from "./App";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: true,
      retry: 1,
      retryDelay: 1200,
    },
  },
});

/** Top-level error boundary so a render crash never blanks the whole app. */
class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Tribuna] Render error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="glass-strong max-w-md rounded-2xl p-8 text-center">
            <div className="mb-4 text-5xl">😵</div>
            <h1 className="mb-2 text-xl font-bold text-[var(--color-slate-100)]">
              Algo se rompió
            </h1>
            <p className="mb-5 text-sm text-[var(--color-slate-400)]">
              Se produjo un error inesperado. Recargá la página para continuar.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-[var(--color-lime-500)] px-5 py-2.5 text-sm font-bold text-[var(--color-void)] transition-colors hover:bg-[var(--color-lime-400)]"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <I18nProvider>
            <App />
          </I18nProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  </StrictMode>
);
