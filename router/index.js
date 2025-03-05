import { Router } from "express";
import adminRouter from "./Admin/adminRouter.js"
import otpRouter from "./OTP/otpRouter.js"
import userRouter from "./User/userRouter.js"

const router = Router();

const defaultRoutes = [
    {
        path: "/admin",
        route: adminRouter
    },
    {
        path: "/otp",
        route: otpRouter
    },
    {
        path: "/user",
        route: userRouter
    }
];

defaultRoutes.forEach(({ path, route }) => {
    router.use(path, route);
});

export default router;
