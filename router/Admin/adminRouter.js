import express from "express";
import { createAdmin, getAdmins,getAdminById,loginAdmin,changeStatus,deleteAdmin } from "../../controller/adminController.js";

const router = express.Router();

router.post("/", createAdmin);
router.get("/", getAdmins);
router.get("/:id", getAdminById);
router.post("/login", loginAdmin);
router.patch("/status/:adminId", changeStatus);
router.delete("/:adminId", deleteAdmin);

export default router;
