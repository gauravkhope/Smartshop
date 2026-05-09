import returnReplaceRoutes from "./routes/returnReplaceRoutes";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import productRoutes from "./routes/productroutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { authenticateToken } from "./middlewares/authMiddleware";
import dotenv from "dotenv";
import { updateUserPassword } from '../lib/userService';
import path from "path";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

console.log("✅ Loading order routes...");
 import orderRoutes from "./routes/orderRoutes";
console.log("✅ Order routes loaded successfully!");

console.log("✅ Loading payment routes...");
import paymentRoutes from "./routes/paymentRoutes";
console.log("✅ Payment routes loaded successfully!");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
  override: true,
});

// ====================================
// CORS Configuration with Environment Support
// ====================================
const getCorsOrigins = (): string[] => {
  const corsOriginsEnv = process.env.CORS_ORIGINS || "";
  const origins: string[] = [];

  // Add configured origins
  if (corsOriginsEnv.trim()) {
    origins.push(
      ...corsOriginsEnv.split(",").map((origin) => origin.trim())
    );
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

const app = express();

app.use(
  cors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Log CORS configuration
if (process.env.NODE_ENV !== "production") {
  console.log("✅ CORS Origins configured:", corsOrigins);
}

// ✅ Serve uploaded images publicly
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// Request logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Health check
app.get("/", (req: Request, res: Response) => {
  res.send("✅ Backend API running!");
});

// Test route
app.get("/api/test", (req: Request, res: Response) => {
  console.log("✅ Test route hit!");
  res.json({ message: "Test successful!" });
});

// ---- ROUTES ----
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", returnReplaceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);


import { verifyUserPassword } from '../lib/userService';
import { verifyEmailTransporter } from './services/emailService';
app.post('/api/verify-password', async (req: Request, res: Response) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    return res.status(400).json({ error: 'Missing userId or password' });
  }
  try {
    await verifyUserPassword(userId, password);
    return res.status(200).json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'You have entered wrong Password') {
      return res.status(401).json({ success: false, error: err.message });
    }
    console.error('Password verification error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Password update route
app.post('/api/update-password', authenticateToken, async (req: Request, res: Response) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized', message: 'Unauthorized' });
  }

  if (!currentPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current password is required',
      message: 'Current password is required',
    });
  }

  if (!newPassword) {
    return res.status(400).json({
      success: false,
      error: 'New password is required',
      message: 'New password is required',
    });
  }

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Password fields must be strings',
      message: 'Password fields must be strings',
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 8 characters',
      message: 'New password must be at least 8 characters',
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      error: 'New password must be different from current password',
      message: 'New password must be different from current password',
    });
  }

  const authenticatedUserId = req.user.id;
  const authenticatedUserEmail = req.user.email;

  // Optional body userId must match authenticated identity if provided.
  if (userId && Number(userId) !== authenticatedUserId) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: cannot update another user password',
      message: 'Forbidden: cannot update another user password',
    });
  }

  try {
    const result = await updateUserPassword(authenticatedUserEmail, currentPassword, newPassword);
    if (result.success) {
      return res.status(200).json({ success: true, message: 'Password updated successfully' });
    } else {
      if (result.error === 'Current password is incorrect') {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect',
          message: 'Current password is incorrect',
        });
      }

      if (result.error === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User not found',
        });
      }

      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to update password',
        message: result.error || 'Failed to update password',
      });
    }
  } catch (err) {
    console.error('Password update error:', err);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Server error' });
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

// ====================================
// ENVIRONMENT VALIDATION
// ====================================
const validateEnvironment = (): void => {
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
    console.error(
      "❌ FATAL: JWT_SECRET must be at least 22 characters long (preferably 32+)"
    );
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
async function runMigrations(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    console.log("🔄 Running database migrations...");
    const { execSync } = require("child_process");
    
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      console.log("✅ Database migrations completed successfully");
    } catch (error) {
      console.error("❌ Migration failed:", error);
      console.log("⚠️  Attempting to push schema instead...");
      try {
        execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
        console.log("✅ Database schema pushed successfully");
      } catch (pushError) {
        console.error("❌ Schema push also failed. Starting server anyway...");
      }
    }
  }
}

// Start the server and handle errors
const PORT = process.env.PORT || 5000;

// Run migrations before starting server (only in production)
;(async () => {
  try {
    await runMigrations();

    try {
      await verifyEmailTransporter();
    } catch (err) {
      if (process.env.NODE_ENV === "production") {
        console.error("❌ Email transporter verification failed in production. Please check SMTP credentials and environment variables.");
        process.exit(1);
      } else {
        console.warn("⚠️ Email transporter verification failed (development). Emails may fall back to Ethereal.", err);
      }
    }

    const server = app.listen(PORT, () => {
      console.log(`📝 Server listening on port ${PORT} and ready to accept requests`);
    });

    server.on("error", (error: unknown) => {
      console.error("❌ Server error:", error);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();
