"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordWithCode = exports.verifyCode = exports.resetPassword = exports.forgotPassword = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailService_1 = require("../../services/emailService");
// Generate 6-digit verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
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
// Request password reset - Send verification code
const forgotPassword = async (req, res) => {
    try {
        const email = String(req.body?.email || "").trim();
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await findUserByEmail(email);
        // Don't reveal if user exists for security
        if (!user) {
            return res.status(200).json({
                message: "If an account exists with this email, you will receive a verification code.",
            });
        }
        // Generate 6-digit verification code
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 600000); // 10 minutes
        // Persist code in database so verification works across restarts/instances.
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                otp: verificationCode,
                otpExpiry: expiresAt,
            },
        });
        // Send verification code email
        try {
            await (0, emailService_1.sendPasswordResetCodeEmail)(user.email, user.name, verificationCode);
            console.log(`Verification code sent to ${email}`);
        }
        catch (emailError) {
            console.error("Email sending error:", emailError);
            return res.status(500).json({ message: "Failed to send verification code. Please check email configuration." });
        }
        return res.status(200).json({
            message: "If an account exists with this email, you will receive a verification code.",
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
        const normalizedEmail = String(email || "").trim();
        const user = await findUserByEmail(normalizedEmail);
        if (!user || !user.otp || !user.otpExpiry) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }
        // Check if expired
        if (new Date() > user.otpExpiry) {
            await prisma_1.default.user.update({
                where: { id: user.id },
                data: { otp: null, otpExpiry: null },
            });
            return res.status(400).json({ message: "Verification code has expired" });
        }
        // Verify code
        if (String(user.otp).trim() !== String(code).trim()) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Update user password and clear OTP
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { password: hashedPassword, otp: null, otpExpiry: null },
        });
        console.log(`Password reset successful for user ID: ${user.id}`);
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
        const normalizedEmail = String(email || "").trim();
        const user = await findUserByEmail(normalizedEmail);
        if (!user || !user.otp || !user.otpExpiry) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }
        if (new Date() > user.otpExpiry) {
            await prisma_1.default.user.update({
                where: { id: user.id },
                data: { otp: null, otpExpiry: null },
            });
            return res.status(400).json({ message: "Verification code has expired" });
        }
        // Trim and compare as strings
        const receivedCode = String(code).trim();
        const storedCode = String(user.otp).trim();
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
        const normalizedEmail = String(email || "").trim();
        const user = await findUserByEmail(normalizedEmail);
        if (!user || !user.otp || !user.otpExpiry) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }
        if (new Date() > user.otpExpiry) {
            await prisma_1.default.user.update({
                where: { id: user.id },
                data: { otp: null, otpExpiry: null },
            });
            return res.status(400).json({ message: "Verification code has expired" });
        }
        // Trim and compare as strings
        const receivedCode = String(code).trim();
        const storedCode = String(user.otp).trim();
        if (storedCode !== receivedCode) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        // Hash new password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Update user password and clear OTP
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { password: hashedPassword, otp: null, otpExpiry: null },
        });
        console.log(`Password reset successful for user ID: ${user.id}`);
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
