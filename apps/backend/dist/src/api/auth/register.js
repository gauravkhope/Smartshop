"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerHandler;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailService_1 = require("../../services/emailService");
async function registerHandler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }
    const { name, email, password } = req.body ?? {};
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await prisma_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        // Generate JWT token for auto-login
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        // Send welcome email (async, don't block response)
        (0, emailService_1.sendWelcomeEmail)(newUser.email, newUser.name).catch((error) => {
            console.error("Failed to send welcome email:", error);
        });
        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
        });
    }
    catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
