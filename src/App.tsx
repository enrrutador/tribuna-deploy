import { Switch, Route, useLocation } from "wouter";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Live from "@/pages/Live";
import Tournament from "@/pages/Tournament";
import Tournaments from "@/pages/Tournaments";
import MatchDetail from "@/pages/MatchDetail";
import Team from "@/pages/Team";
import Favorites from "@/pages/Favorites";
import NotFound from "@/pages/NotFound";

function AnimatedRoutes() {
  const [location] = useLocation();

  // NOTE: We intentionally avoid <AnimatePresence mode="wait"> here.
  // With framer-motion v11 + React 19, the exit animation can fail to
  // resolve, which blocks the new route from mounting and leaves the
  // page blank until a hard refresh. Using a plain key'd motion.div
  // remounts the subtree per route (clean query state) and keeps a
  // smooth enter animation without the risk.
  return (
    <motion.div
      key={location}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
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
        <Route component={NotFound} />
      </Switch>
    </motion.div>
  );
}

export default function App() {
  return (
    <Layout>
      <AnimatedRoutes />
    </Layout>
  );
}
