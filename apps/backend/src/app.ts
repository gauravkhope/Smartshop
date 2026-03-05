import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productroutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import orderRoutes from "./routes/orderRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import profileRoutes from "./routes/profile";

dotenv.config();

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

// ✅ Enable JSON parsing
app.use(express.json());

// ✅ Serve static files from uploads folder (for avatars)
app.use("/uploads", express.static("uploads"));

// ✅ Mount routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/user", profileRoutes); // ✅ NEW route for profile (PUT /api/user/profile)
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

export default app;
