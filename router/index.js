import { Router } from "express";
import adminRouter from "./Admin/adminRouter.js"

const router = Router();

const defaultRoutes = [
    {
        path: "/admin",
        route: adminRouter
    }
];

defaultRoutes.forEach(({ path, route }) => {
    router.use(path, route);
});

export default router;
