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

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://smartshop-one.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());
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

// Start the server and handle errors
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`📝 Server listening on port ${PORT} and ready to accept requests`);
});

server.on("error", (error: unknown) => {
  console.error("❌ Server error:", error);
});
