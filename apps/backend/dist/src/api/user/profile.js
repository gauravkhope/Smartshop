"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
// Get current user profile
const getUserProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user });
    }
    catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getUserProfile = getUserProfile;
// Update user profile (with avatar support)
const updateUserProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { name, email } = req.body;
        let avatar = req.body.avatar;
        // ✅ If file uploaded, replace avatar path
        if (req.file) {
            avatar = `/uploads/${req.file.filename}`;
        }
        // Validate name
        if (!name || name.trim().length < 2) {
            return res
                .status(400)
                .json({ message: "Name must be at least 2 characters long" });
        }
        // Check if email already exists for another user
        if (email && email !== req.user.email) {
            const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }
        // ✅ Update user in database
        const updatedUser = await prisma_1.default.user.update({
            where: { id: req.user.id },
            data: {
                name: name.trim(),
                ...(email && { email }),
                ...(avatar && { avatar }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
            },
        });
        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateUserProfile = updateUserProfile;
