import express from "express";
import { getUserAlerts } from "../controllers/alertController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔒 Protected route
router.get("/", verifyToken, getUserAlerts);

export default router;