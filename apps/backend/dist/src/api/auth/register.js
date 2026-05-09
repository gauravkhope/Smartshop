"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerHandler;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailService_1 = require("../../services/emailService");
const redis_1 = require("../../lib/redis");
async function registerHandler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }
    const { name, email, password } = req.body ?? {};
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
        return res.status(400).json({ message: "Email is required" });
    }
    try {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: normalizedEmail },
        });
        // ✅ STEP 1: Send OTP
        if (!password) {
            const normalizedName = String(name || "").trim();
            if (!normalizedName) {
                return res.status(400).json({ message: "Name and email are required" });
            }
            if (existingUser) {
                return res.status(400).json({ message: "This email is already registered" });
            }
            const blocked = await (0, redis_1.checkBlocked)(normalizedEmail);
            if (blocked) {
                return res.status(429).json({
                    message: "Too many failed attempts. Try again after 10 minutes.",
                });
            }
            const rateLimit = await (0, redis_1.checkRateLimit)(normalizedEmail);
            if (!rateLimit.allowed) {
                return res.status(429).json({
                    message: "Too many OTP requests. Please try again later.",
                });
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await (0, redis_1.storeOtp)(normalizedEmail, normalizedName, otp);
            try {
                await (0, emailService_1.sendRegistrationOtpEmail)(normalizedEmail, normalizedName, otp);
            }
            catch (error) {
                console.error("Failed to send OTP email:", error);
                return res.status(500).json({ message: "Failed to send OTP" });
            }
            return res.status(200).json({
                message: "Register OTP sent successfully.",
            });
        }
        // ✅ STEP 3: Create user AFTER verification
        if (existingUser) {
            return res.status(400).json({ message: "This email is already registered" });
        }
        const otpData = await (0, redis_1.getOtpData)(normalizedEmail);
        if (!otpData) {
            return res.status(400).json({ message: "OTP expired or not requested." });
        }
        if (!otpData.verified) {
            return res.status(400).json({ message: "Please verify OTP first." });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        await prisma_1.default.user.create({
            data: {
                name: otpData.name,
                email: normalizedEmail,
                password: hashedPassword,
                isVerified: true,
            },
        });
        // ✅ Cleanup OTP
        await (0, redis_1.deleteOtp)(normalizedEmail);
        return res.status(200).json({
            message: "Account created successfully!",
        });
    }
    catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
