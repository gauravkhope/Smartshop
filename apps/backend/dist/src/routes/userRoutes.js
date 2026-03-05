"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const profile_1 = require("../api/user/profile");
const loginHistory_1 = require("../api/user/loginHistory");
const router = (0, express_1.Router)();
// Protected routes - require authentication
router.get("/profile", authMiddleware_1.authenticateToken, profile_1.getUserProfile);
router.put("/profile", authMiddleware_1.authenticateToken, profile_1.updateUserProfile);
router.get("/login-history", authMiddleware_1.authenticateToken, loginHistory_1.getLoginHistory);
exports.default = router;
