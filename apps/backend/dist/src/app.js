"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const productroutes_1 = __importDefault(require("./routes/productroutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: ["http://localhost:3000", "http://localhost:3001"] })); // frontend ports
app.use(express_1.default.json());
// ✅ Mount routes correctly
app.use("/api/products", productroutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/user", userRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.get("/", (req, res) => {
    res.json({ message: "Welcome to AI E-commerce Backend 🚀" });
});
exports.default = app;
