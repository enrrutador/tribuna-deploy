import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tournamentsRouter from "./tournaments";
import matchesRouter from "./matches";
import teamsRouter from "./teams";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/tournaments", tournamentsRouter);
router.use("/matches", matchesRouter);
router.use("/teams", teamsRouter);

export default router;
