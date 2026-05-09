"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = loginHandler;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../lib/prisma")); // <-- keep your correct path
const redis_1 = require("../../lib/redis");
async function loginHandler(req, res) {
    console.log("[login] Headers:", req.headers);
    console.log("[login] Body:", req.body);
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        return res.status(400).json({
            message: "Invalid request body. Send JSON body { email, password } with Content-Type: application/json",
        });
    }
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    try {
        const blocked = await (0, redis_1.checkLoginBlocked)(email);
        if (blocked) {
            return res.status(429).json({
                message: "Too many failed attempts. Try again after 10 minutes.",
                remainingAttempts: 0,
            });
        }
        // ✅ Include avatar field in the query
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                role: true,
                avatar: true, // <--- include avatar field
            },
        });
        if (!user || !user.password || typeof user.password !== "string") {
            const { remainingAttempts } = await (0, redis_1.registerLoginFailure)(email);
            return res.status(401).json({
                message: "Invalid email or password",
                remainingAttempts,
            });
        }
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            const { remainingAttempts } = await (0, redis_1.registerLoginFailure)(email);
            return res.status(401).json({
                message: "Invalid email or password",
                remainingAttempts,
            });
        }
        await (0, redis_1.clearLoginAttempts)(email);
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
        // ✅ Return avatar in response (so frontend can show it)
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar, // <--- send avatar to frontend
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
