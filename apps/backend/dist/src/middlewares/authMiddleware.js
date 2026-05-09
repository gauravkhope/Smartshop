"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const extractToken = (req) => {
    const authHeader = req.headers["authorization"];
    const fallbackHeader = req.headers["x-access-token"];
    const rawHeader = Array.isArray(authHeader)
        ? authHeader[0]
        : authHeader || (Array.isArray(fallbackHeader) ? fallbackHeader[0] : fallbackHeader);
    if (!rawHeader || typeof rawHeader !== "string") {
        return null;
    }
    const trimmed = rawHeader.trim();
    if (!trimmed) {
        return null;
    }
    // Accept both "Bearer <token>" and raw token strings.
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("bearer ")) {
        return trimmed.slice(7).trim() || null;
    }
    return trimmed;
};
const authenticateToken = (req, res, next) => {
    try {
        const token = extractToken(req);
        console.log(`[AUTH DEBUG] Extracted token:`, token ? token.slice(0, 10) + '...' : 'NONE');
        if (!token) {
            console.warn('[AUTH DEBUG] No token found in request headers');
            return res.status(401).json({ message: "Access token required" });
        }
        // Verify token
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.warn('[AUTH DEBUG] Invalid or expired token:', err.message);
                return res.status(403).json({ message: "Invalid or expired token" });
            }
            // Attach user info to request
            req.user = {
                id: Number(decoded.id),
                email: decoded.email,
            };
            console.log(`[AUTH DEBUG] Authenticated user:`, req.user);
            next();
        });
    }
    catch (error) {
        console.error("[AUTH DEBUG] Auth middleware error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.authenticateToken = authenticateToken;
// Optional middleware - doesn't block if no token
const optionalAuth = (req, res, next) => {
    try {
        const token = extractToken(req);
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
