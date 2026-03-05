"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const login_1 = __importDefault(require("../api/auth/login"));
const register_1 = __importDefault(require("../api/auth/register"));
const passwordReset_1 = require("../api/auth/passwordReset");
const router = (0, express_1.Router)();
// Authentication routes
router.post("/login", login_1.default);
router.post("/register", register_1.default);
// Password reset routes (Sprint 2)
router.post("/forgot-password", passwordReset_1.forgotPassword);
router.post("/reset-password", passwordReset_1.resetPassword); // Old token-based method
// Verification code routes (new system)
router.post("/verify-code", passwordReset_1.verifyCode);
router.post("/reset-password-with-code", passwordReset_1.resetPasswordWithCode);
exports.default = router;
