"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordWithCode = exports.verifyCode = exports.resetPassword = exports.verifyResetCode = exports.forgotPassword = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailService_1 = require("../../services/emailService");
const redis_1 = require("../../lib/redis");
// Generate 6-digit code
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
// Find user
async function findUserByEmail(email) {
    return prisma_1.default.user.findFirst({
        where: {
            email: {
                equals: email,
                mode: "insensitive",
            },
        },
    });
}
//
// ✅ 1. FORGOT PASSWORD (SEND CODE)
//
const forgotPassword = async (req, res) => {
    try {
        const email = String(req.body?.email || "").trim();
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                message: "This EMail not Registered . Please Register First...",
            });
        }
        const code = generateCode();
        await (0, redis_1.storePasswordResetCode)(email, user.id, code);
        try {
            await (0, emailService_1.sendPasswordResetCodeEmail)(user.email, user.name, code);
        }
        catch (error) {
            console.error("Email error:", error);
            return res.status(500).json({ message: "Failed to send code" });
        }
        return res.status(200).json({
            message: "If an account exists, you will receive a code.",
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.forgotPassword = forgotPassword;
//
// ✅ 2. VERIFY CODE (STEP 2)
//
const verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        const normalizedEmail = String(email || "").trim();
        if (!normalizedEmail || !code) {
            return res.status(400).json({ message: "Email and code required" });
        }
        const redisData = await (0, redis_1.getPasswordResetData)(normalizedEmail);
        if (!redisData) {
            return res.status(400).json({
                message: "Code expired or not found",
            });
        }
        const isValid = await (0, redis_1.verifyPasswordResetCode)(normalizedEmail, code);
        if (!isValid) {
            return res.status(400).json({
                message: "Invalid code",
            });
        }
        // ✅ Mark verified
        await (0, redis_1.markPasswordResetVerified)(normalizedEmail);
        return res.status(200).json({
            message: "Code verified successfully",
        });
    }
    catch (error) {
        console.error("Verify code error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.verifyResetCode = verifyResetCode;
//
// ✅ 3. RESET PASSWORD (FINAL STEP)
//
const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || "").trim();
        if (!normalizedEmail || !password) {
            return res.status(400).json({
                message: "Email and password required",
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters",
            });
        }
        const resetData = await (0, redis_1.getPasswordResetData)(normalizedEmail);
        if (!resetData) {
            return res.status(400).json({
                message: "Reset session expired",
            });
        }
        if (!resetData.verified) {
            return res.status(400).json({
                message: "Please verify code first",
            });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: resetData.userId },
        });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        await prisma_1.default.user.update({
            where: { id: resetData.userId },
            data: { password: hashedPassword },
        });
        // ✅ Cleanup
        await (0, redis_1.deletePasswordResetCode)(normalizedEmail);
        return res.status(200).json({
            message: "Password reset successful",
        });
    }
    catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.resetPassword = resetPassword;
// Backward-compatible exports for existing routes/frontend usage.
exports.verifyCode = exports.verifyResetCode;
exports.resetPasswordWithCode = exports.resetPassword;
