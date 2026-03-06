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
const userService_1 = require("../lib/userService");
const path_1 = __importDefault(require("path"));
console.log("✅ Loading order routes...");
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
console.log("✅ Order routes loaded successfully!");
console.log("✅ Loading payment routes...");
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
console.log("✅ Payment routes loaded successfully!");
dotenv_1.default.config({ path: __dirname + "/../.env" });
dotenv_1.default.config();
// ====================================
// CORS Configuration with Environment Support
// ====================================
const getCorsOrigins = () => {
    const corsOriginsEnv = process.env.CORS_ORIGINS || "";
    const origins = [];
    // Add configured origins
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
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
}));
app.use(express_1.default.json());
// Log CORS configuration
if (process.env.NODE_ENV !== "production") {
    console.log("✅ CORS Origins configured:", corsOrigins);
}
// ✅ Serve uploaded images publicly
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
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
app.use("/api/payments", paymentRoutes_1.default);
const userService_2 = require("../lib/userService");
app.post('/api/verify-password', async (req, res) => {
    const { userId, password } = req.body;
    if (!userId || !password) {
        return res.status(400).json({ error: 'Missing userId or password' });
    }
    try {
        await (0, userService_2.verifyUserPassword)(userId, password);
        return res.status(200).json({ success: true });
    }
    catch (err) {
        if (err instanceof Error && err.message === 'You have entered wrong Password') {
            return res.status(401).json({ success: false, error: err.message });
        }
        console.error('Password verification error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});
// Password update route
app.post('/api/update-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const result = await (0, userService_1.updateUserPassword)(userId, currentPassword, newPassword);
        if (result.success) {
            return res.status(200).json({ success: true });
        }
        else {
            // Return 401 for wrong password or user not found
            return res.status(401).json({ success: false, error: result.error || 'You have entered wrong Password' });
        }
    }
    catch (err) {
        console.error('Password update error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});
// ====================================
// ENVIRONMENT VALIDATION
// ====================================
const validateEnvironment = () => {
    const requiredEnvVars = [
        "DATABASE_URL",
        "JWT_SECRET",
        "EMAIL_USER",
        "EMAIL_PASSWORD",
    ];
    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
        console.error("❌ FATAL: Missing required environment variables:");
        missingEnvVars.forEach((envVar) => {
            console.error(`   - ${envVar}`);
        });
        console.error("\n   Please set these variables in your .env file");
        process.exit(1);
    }
    // Validate JWT_SECRET strength
    const jwtSecret = process.env.JWT_SECRET || "";
    if (jwtSecret.length < 22) {
        console.error("❌ FATAL: JWT_SECRET must be at least 22 characters long (preferably 32+)");
        process.exit(1);
    }
    if (process.env.NODE_ENV !== "production") {
        console.log("✅ All required environment variables are set");
    }
};
validateEnvironment();
// ====================================
// AUTO-RUN DATABASE MIGRATIONS ON STARTUP
// ====================================
async function runMigrations() {
    if (process.env.NODE_ENV === "production") {
        console.log("🔄 Running database migrations...");
        const { execSync } = require("child_process");
        try {
            execSync("npx prisma migrate deploy", { stdio: "inherit" });
            console.log("✅ Database migrations completed successfully");
        }
        catch (error) {
            console.error("❌ Migration failed:", error);
            console.log("⚠️  Attempting to push schema instead...");
            try {
                execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
                console.log("✅ Database schema pushed successfully");
            }
            catch (pushError) {
                console.error("❌ Schema push also failed. Starting server anyway...");
            }
        }
    }
}
// Start the server and handle errors
const PORT = process.env.PORT || 5000;
// Run migrations before starting server (only in production)
runMigrations()
    .then(() => {
    const server = app.listen(PORT, () => {
        console.log(`📝 Server listening on port ${PORT} and ready to accept requests`);
    });
    server.on("error", (error) => {
        console.error("❌ Server error:", error);
    });
})
    .catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
});
