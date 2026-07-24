import { Router } from "express";
import userRouter from "../api/users/usersRouter.js";
import menuRouter from "../api/Menu/menu.routes.js";
import favoritesRouter from "../api/Favorites/favorites.routes.js";
import reviewsRouter from "../api/reviews/reviews.routes.js";
import branchesRouter from "../api/branches/branches.routes.js";

const appRouter = Router();

appRouter.use("/users", userRouter);
appRouter.use("/menu", menuRouter);
appRouter.use("/favorites", favoritesRouter);
appRouter.use("/reviews", reviewsRouter);
appRouter.use("/branches", branchesRouter);

export default appRouter;
