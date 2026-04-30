// routes/hospitalRoutes.js

import express from "express";
import { loginHospital,getHospitalAlerts,registerHospital,updateHospitalAlertStatus } from "../controllers/hospitalController.js";

const router = express.Router();
router.post('/register',registerHospital)
router.post("/login", loginHospital);
router.get("/alerts/:hospitalId", getHospitalAlerts);
router.patch("/alerts/:alertId/status", updateHospitalAlertStatus);
export default router;