import express from "express";
import { createGuest,createUser } from "../../controller/userController.js";

const router = express.Router();

router.post("/us", createUser);
router.post("gs", createGuest);

export default router;
