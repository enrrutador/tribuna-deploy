import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tournamentsRouter from "./tournaments";
import matchesRouter from "./matches";
import teamsRouter from "./teams";
import playersRouter from "./players";
import squadsRouter from "./squads";
import transfersRouter from "./transfers";
import newsRouter from "./news";
import lineupsRouter from "./lineups";
import searchRouter from "./search";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/tournaments", tournamentsRouter);
router.use("/matches", matchesRouter);
router.use("/teams", teamsRouter);
router.use("/players", playersRouter);
router.use("/squads", squadsRouter);
router.use("/transfers", transfersRouter);
router.use("/news", newsRouter);
router.use("/lineups", lineupsRouter);
router.use("/search", searchRouter);

export default router;
