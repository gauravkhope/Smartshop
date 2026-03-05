import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { getUserProfile, updateUserProfile } from "../api/user/profile";
import { getLoginHistory } from "../api/user/loginHistory";
import upload from "../middlewares/upload"; // ✅ Add this line

const router = Router();

// ✅ Protected routes (require authentication)
router.get("/profile", authenticateToken, getUserProfile);

// ✅ Update profile with avatar upload support
router.put(
  "/profile",
  authenticateToken,
  upload.single("avatar"), // 👈 Handles avatar file upload
  updateUserProfile
);

router.get("/login-history", authenticateToken, getLoginHistory);

export default router;
