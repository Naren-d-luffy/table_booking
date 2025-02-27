import express from "express";
import { createAdmin, getAdmins,getAdminById,loginAdmin,changeStatus,deleteAdmin, forgotPassword,resetPassword } from "../../controller/adminController.js";

const router = express.Router();

router.post("/", createAdmin);
router.get("/", getAdmins);
router.get("/:id", getAdminById);
router.post("/login", loginAdmin);
router.patch("/status/:adminId", changeStatus);
router.delete("/:adminId", deleteAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
