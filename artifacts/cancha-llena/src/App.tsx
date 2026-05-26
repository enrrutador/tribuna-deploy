import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Tournament from "@/pages/Tournament";
import TeamPage from "@/pages/TeamPage";
import MatchDetail from "@/pages/MatchDetail";
import Layout from "@/components/Layout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is immediately stale — always check server on focus/mount
      staleTime: 0,
      // Refetch when tab becomes active again
      refetchOnWindowFocus: true,
      // Refetch when network reconnects
      refetchOnReconnect: true,
      // Refetch on component mount if stale (which is always, given staleTime: 0)
      refetchOnMount: true,
      // Default background refresh: 30s (overridden per-query where needed)
      refetchInterval: 30_000,
      // Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/torneo/:slug" component={Tournament} />
        <Route path="/equipo/:id" component={TeamPage} />
        <Route path="/partido/:id" component={MatchDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
