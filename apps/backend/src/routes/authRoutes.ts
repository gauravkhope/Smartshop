import { Router } from "express";
import loginHandler from "../api/auth/login";
import registerHandler from "../api/auth/register";
import verifyOtpHandler from "../api/auth/verifyOtp";
import { forgotPassword, resetPassword, verifyCode, resetPasswordWithCode } from "../api/auth/passwordReset";

const router = Router();

// Authentication routes
router.post("/login", loginHandler);
router.post("/register", registerHandler);
router.post("/verifyOtp", verifyOtpHandler);

// Password reset routes (Sprint 2)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword); // Old token-based method

// Verification code routes (new system)
router.post("/verify-code", verifyCode);
router.post("/reset-password-with-code", resetPasswordWithCode);

export default router;
