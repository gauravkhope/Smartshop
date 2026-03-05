"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
        if (!token) {
            return res.status(401).json({ message: "Access token required" });
        }
        // Verify token
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Invalid or expired token" });
            }
            // Attach user info to request
            req.user = {
                id: Number(decoded.id),
                email: decoded.email,
            };
            next();
        });
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.authenticateToken = authenticateToken;
// Optional middleware - doesn't block if no token
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            return next(); // Continue without user
        }
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (!err && decoded) {
                req.user = {
                    id: Number(decoded.id),
                    email: decoded.email,
                };
            }
            next();
        });
    }
    catch (error) {
        next(); // Continue even if error
    }
};
exports.optionalAuth = optionalAuth;
