import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import productRoutes from "./routes/productroutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import dotenv from "dotenv";
import { updateUserPassword } from '../lib/userService';
import path from "path";

console.log("✅ Loading order routes...");
 import orderRoutes from "./routes/orderRoutes";
console.log("✅ Order routes loaded successfully!");

console.log("✅ Loading payment routes...");
import paymentRoutes from "./routes/paymentRoutes";
console.log("✅ Payment routes loaded successfully!");

dotenv.config({ path: __dirname + "/../.env" });

dotenv.config();

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
app.use(express.json());

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
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);


import { verifyUserPassword } from '../lib/userService';
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
app.post('/api/update-password', async (req: Request, res: Response) => {
  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await updateUserPassword(userId, currentPassword, newPassword);
    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      // Return 401 for wrong password or user not found
      return res.status(401).json({ success: false, error: result.error || 'You have entered wrong Password' });
    }
  } catch (err) {
    console.error('Password update error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

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
runMigrations()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`📝 Server listening on port ${PORT} and ready to accept requests`);
    });

    server.on("error", (error: unknown) => {
      console.error("❌ Server error:", error);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  });
