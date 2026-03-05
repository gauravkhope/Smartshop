"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordWithCode = exports.verifyCode = exports.resetPassword = exports.forgotPassword = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailService_1 = require("../../services/emailService");
// In-memory storage for verification codes
const verificationCodes = new Map();
// Generate 6-digit verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
// Request password reset - Send verification code
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        // Don't reveal if user exists for security
        if (!user) {
            return res.status(200).json({
                message: "If an account exists with this email, you will receive a verification code.",
            });
        }
        // Generate 6-digit verification code
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 600000); // 10 minutes
        // Store code with email as key
        verificationCodes.set(email.toLowerCase(), {
            code: verificationCode,
            userId: user.id,
            expiresAt,
        });
        // Send verification code email
        try {
            await (0, emailService_1.sendPasswordResetCodeEmail)(user.email, user.name, verificationCode);
            console.log(`✅ Verification code sent to ${email}: ${verificationCode}`);
        }
        catch (emailError) {
            console.error("❌ Email sending error:", emailError);
            return res.status(500).json({ message: "Failed to send verification code. Please check email configuration." });
        }
        return res.status(200).json({
            message: "If an account exists with this email, you will receive a verification code.",
            // For testing - remove in production
            verificationCode,
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.forgotPassword = forgotPassword;
// Verify code and reset password
const resetPassword = async (req, res) => {
    try {
        const { email, code, password } = req.body;
        if (!email || !code || !password) {
            return res.status(400).json({ message: "Email, verification code, and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        // Get verification code from memory
        const storedData = verificationCodes.get(email.toLowerCase());
        if (!storedData) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }
        // Check if expired
        if (new Date() > storedData.expiresAt) {
            verificationCodes.delete(email.toLowerCase());
            return res.status(400).json({ message: "Verification code has expired" });
        }
        // Verify code
        if (storedData.code !== code) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Update user password
        await prisma_1.default.user.update({
            where: { id: storedData.userId },
            data: { password: hashedPassword },
        });
        // Delete used code
        verificationCodes.delete(email.toLowerCase());
        console.log(`✅ Password reset successful for user ID: ${storedData.userId}`);
        return res.status(200).json({
            message: "Password reset successful. You can now login with your new password.",
        });
    }
    catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.resetPassword = resetPassword;
// Verify code only (without resetting password)
const verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ message: "Email and code are required" });
        }
        const storedData = verificationCodes.get(email.toLowerCase());
        console.log(`🔍 Verifying code for ${email}:`);
        console.log(`  Received code: "${code}" (type: ${typeof code})`);
        console.log(`  Stored data:`, storedData);
        if (!storedData) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }
        if (new Date() > storedData.expiresAt) {
            verificationCodes.delete(email.toLowerCase());
            return res.status(400).json({ message: "Verification code has expired" });
        }
        // Trim and compare as strings
        const receivedCode = String(code).trim();
        const storedCode = String(storedData.code).trim();
        console.log(`  Comparing: "${receivedCode}" === "${storedCode}"`);
        if (storedCode !== receivedCode) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        return res.status(200).json({ message: "Code verified successfully" });
    }
    catch (error) {
        console.error("Verify code error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.verifyCode = verifyCode;
// Reset password with verification code
const resetPasswordWithCode = async (req, res) => {
    try {
        const { email, code, password } = req.body;
        if (!email || !code || !password) {
            return res.status(400).json({ message: "Email, code, and password are required" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }
        const storedData = verificationCodes.get(email.toLowerCase());
        if (!storedData) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }
        if (new Date() > storedData.expiresAt) {
            verificationCodes.delete(email.toLowerCase());
            return res.status(400).json({ message: "Verification code has expired" });
        }
        // Trim and compare as strings
        const receivedCode = String(code).trim();
        const storedCode = String(storedData.code).trim();
        if (storedCode !== receivedCode) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Update user password
        await prisma_1.default.user.update({
            where: { id: storedData.userId },
            data: { password: hashedPassword },
        });
        // Delete used code
        verificationCodes.delete(email.toLowerCase());
        console.log(`✅ Password reset successful for user ID: ${storedData.userId}`);
        return res.status(200).json({
            message: "Password reset successful. You can now login with your new password.",
        });
    }
    catch (error) {
        console.error("Reset password with code error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.resetPasswordWithCode = resetPasswordWithCode;
