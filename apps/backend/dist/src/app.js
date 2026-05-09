"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const productroutes_1 = __importDefault(require("./routes/productroutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const returnReplaceRoutes_1 = __importDefault(require("./routes/returnReplaceRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, "../.env"),
    override: true,
});
const app = (0, express_1.default)();
// ====================================
// CORS setup with environment support
// ====================================
const getCorsOrigins = () => {
    const corsOriginsEnv = process.env.CORS_ORIGINS || "";
    const origins = [];
    // Add configured origins from environment
    if (corsOriginsEnv.trim()) {
        origins.push(...corsOriginsEnv.split(",").map((origin) => origin.trim()));
    }
    // Add local development origins if not in production
    if (process.env.NODE_ENV !== "production") {
        if (!origins.includes("http://localhost:3000")) {
            origins.push("http://localhost:3000");
        }
        if (!origins.includes("http://localhost:3001")) {
            origins.push("http://localhost:3001");
        }
    }
    return origins;
};
const corsOrigins = getCorsOrigins();
// Apply CORS middleware
app.use((0, cors_1.default)({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Body parsers must run before routes
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "1mb" }));
// ✅ Serve static files from uploads folder (for avatars)
app.use("/uploads", express_1.default.static("uploads"));
// ✅ Mount routes
app.use("/api/products", productroutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/user", userRoutes_1.default);
app.use("/api/orders", returnReplaceRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/payments", paymentRoutes_1.default);
// Catch-all unmatched route logger for debugging
app.use((req, res, next) => {
    console.error(`[ROUTE DEBUG] Unmatched route: ${req.method} ${req.originalUrl}`);
    next();
});
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
