import { Router } from "express";
import userRouter from "../api/users/usersRouter.js";

const appRouter = Router();

appRouter.use("/users", userRouter);

export default appRouter;
