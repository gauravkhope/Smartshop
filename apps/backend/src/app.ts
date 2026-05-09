import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import productRoutes from "./routes/productroutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import orderRoutes from "./routes/orderRoutes";
import returnReplaceRoutes from "./routes/returnReplaceRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
  override: true,
});

const app: Application = express();

// ====================================
// CORS setup with environment support
// ====================================
const getCorsOrigins = (): string[] => {
  const corsOriginsEnv = process.env.CORS_ORIGINS || "";
  const origins: string[] = [];

  // Add configured origins from environment
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

// Apply CORS middleware
app.use(
  cors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsers must run before routes
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ✅ Serve static files from uploads folder (for avatars)
app.use("/uploads", express.static("uploads"));

// ✅ Mount routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", returnReplaceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// Catch-all unmatched route logger for debugging
app.use((req, res, next) => {
  console.error(`[ROUTE DEBUG] Unmatched route: ${req.method} ${req.originalUrl}`);
  next();
});
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
