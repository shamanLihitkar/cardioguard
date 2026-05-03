import express from 'express';
const router=express.Router();
import {generateOtp,verifyOtp,resetPassword}from "../controllers/otpController.js";
router.post("/get-otp",generateOtp);
router.post("/verify-otp",verifyOtp);
router.post("/reset-password",resetPassword);
export default router;