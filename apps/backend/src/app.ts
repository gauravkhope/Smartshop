import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productroutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import orderRoutes from "./routes/orderRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import profileRoutes from "./routes/profile"; // ✅ NEW IMPORT

dotenv.config();

const app: Application = express();

// ✅ CORS setup for frontend ports
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"] }));

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
