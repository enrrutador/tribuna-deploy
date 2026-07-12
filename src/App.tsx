import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import Layout from "@/components/layout/Layout";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import Home from "@/pages/Home";
import Live from "@/pages/Live";
import Tournament from "@/pages/Tournament";
import Tournaments from "@/pages/Tournaments";
import MatchDetail from "@/pages/MatchDetail";
import Team from "@/pages/Team";
import Favorites from "@/pages/Favorites";
import Trending from "@/pages/Trending";
import TrendingDetail from "@/pages/TrendingDetail";
import NotFound from "@/pages/NotFound";
import { useTranslation } from "@/lib/i18n";

function AnimatedRoutes() {
  const { t } = useTranslation();
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);

  return (
    <div key={location} className="animate-page-in">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/live" component={Live} />
        <Route path="/tournaments" component={Tournaments} />
        <Route path="/tournament/:slug">
          {(params) => <Tournament slug={params.slug} />}
        </Route>
        <Route path="/match/:id">
          {(params) => <MatchDetail id={params.id} />}
        </Route>
        <Route path="/team/:id">
          {(params) => <Team id={params.id} />}
        </Route>
        <Route path="/favorites" component={Favorites} />
        <Route path="/tendencias" component={Trending} />
        <Route path="/tendencias/:slug">
          {(params) => <TrendingDetail slug={params.slug} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </ErrorBoundary>
  );
}
