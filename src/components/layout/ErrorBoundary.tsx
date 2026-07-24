import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { I18nCtx, type I18nContext } from "@/lib/i18n";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  static contextType = I18nCtx;
  declare context: I18nContext;

  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    const t = this.context?.t ?? ((k: string) => k);
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <GlassCard variant="strong" className="max-w-md w-full p-8 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-[var(--color-danger)]/10 flex items-center justify-center">
              <AlertTriangle size={24} className="text-[var(--color-danger)]" />
            </div>
            <h2 className="text-lg font-bold text-[var(--color-slate-100)]">{t("Algo salió mal")}</h2>
            <p className="text-sm text-[var(--color-slate-400)]">
              {t("Se produjo un error inesperado. Probá recargar la página.")}
            </p>
            {this.state.error && (
              <p className="text-[10px] text-[var(--color-slate-600)] font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="mt-2"
            >
              <RefreshCw size={14} className="mr-2" />
              {t("Recargar")}
            </Button>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}
