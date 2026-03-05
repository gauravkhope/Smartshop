"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const productroutes_1 = __importDefault(require("./routes/productroutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
console.log("✅ Loading order routes...");
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
console.log("✅ Order routes loaded successfully!");
dotenv_1.default.config({ path: __dirname + "/../.env" });
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: ["http://localhost:3000", "http://localhost:3001"] }));
app.use(express_1.default.json());
// Request logger middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    next();
});
// Health check
app.get("/", (req, res) => {
    res.send("✅ Backend API running!");
});
// Test route
app.get("/api/test", (req, res) => {
    console.log("✅ Test route hit!");
    res.json({ message: "Test successful!" });
});
// ---- ROUTES ----
app.use("/api/products", productroutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/user", userRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
// Global error handler
process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    // Don't exit immediately - log the error and continue
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    // Don't exit immediately - log the error and continue
});
const PORT = process.env.PORT || 5555;
const server = app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
    console.log(`📧 Email configured: ${process.env.EMAIL_USER}`);
    console.log(`📝 Server listening and ready to accept requests`);
});
server.on("error", (error) => {
    console.error("❌ Server error:", error);
});
