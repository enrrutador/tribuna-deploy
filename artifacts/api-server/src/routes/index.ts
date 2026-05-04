import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tournamentsRouter from "./tournaments";
import matchesRouter from "./matches";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/tournaments", tournamentsRouter);
router.use("/matches", matchesRouter);

export default router;
