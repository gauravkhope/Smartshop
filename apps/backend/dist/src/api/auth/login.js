"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = loginHandler;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../lib/prisma")); // <-- update path as needed
async function loginHandler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        // Track login history - Temporarily disabled until Prisma client is regenerated
        // const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";
        // const userAgent = req.headers["user-agent"] || "Unknown";
        // // Parse user agent for device and browser info
        // let device = "Desktop";
        // let browser = "Unknown";
        // if (userAgent.toLowerCase().includes("mobile")) device = "Mobile";
        // else if (userAgent.toLowerCase().includes("tablet")) device = "Tablet";
        // if (userAgent.includes("Chrome")) browser = "Chrome";
        // else if (userAgent.includes("Firefox")) browser = "Firefox";
        // else if (userAgent.includes("Safari")) browser = "Safari";
        // else if (userAgent.includes("Edge")) browser = "Edge";
        // await prisma.loginHistory.create({
        //   data: {
        //     userId: user.id,
        //     ipAddress,
        //     userAgent,
        //     device,
        //     browser,
        //   },
        // });
        return res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
