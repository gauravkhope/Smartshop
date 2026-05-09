"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserAccount = exports.updateUserProfile = exports.getUserProfile = void 0;
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
        const currentUser = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true },
        });
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const rawName = req.body.name;
        const rawEmail = req.body.email;
        const rawAvatar = req.body.avatar;
        let name;
        let email;
        let avatar;
        const hasBodyFields = typeof rawName !== "undefined" ||
            typeof rawEmail !== "undefined" ||
            typeof rawAvatar !== "undefined";
        // Return a clear message when no payload is sent for profile update.
        if (!hasBodyFields && !req.file) {
            return res.status(400).json({
                message: "Request body is missing. Provide at least name, email, or avatar.",
            });
        }
        if (typeof rawName !== "undefined") {
            if (typeof rawName !== "string") {
                return res.status(400).json({ message: "Name must be a string" });
            }
            name = rawName.trim();
            if (name.length < 2) {
                return res
                    .status(400)
                    .json({ message: "Name must be at least 2 characters long" });
            }
            if (name === currentUser.name.trim()) {
                return res.status(400).json({ message: "New name must be different from current name" });
            }
        }
        if (typeof rawEmail !== "undefined") {
            if (typeof rawEmail !== "string") {
                return res.status(400).json({ message: "Email must be a string" });
            }
            email = rawEmail.trim();
            if (!email) {
                return res.status(400).json({ message: "Email cannot be empty" });
            }
            if (email.toLowerCase() === currentUser.email.toLowerCase()) {
                return res.status(400).json({ message: "New email must be different from current email" });
            }
        }
        if (typeof rawAvatar !== "undefined") {
            if (typeof rawAvatar !== "string") {
                return res.status(400).json({ message: "Avatar must be a string link" });
            }
            const trimmedAvatar = rawAvatar.trim();
            if (!trimmedAvatar) {
                return res.status(400).json({ message: "Avatar cannot be empty" });
            }
            try {
                new URL(trimmedAvatar);
            }
            catch {
                return res.status(400).json({ message: "Avatar should be a valid link" });
            }
            avatar = trimmedAvatar;
        }
        // ✅ If file uploaded, replace avatar path
        if (req.file) {
            avatar = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }
        // Check if email already exists for another user
        if (email) {
            const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
            if (existingUser && existingUser.id !== currentUser.id) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }
        const dataToUpdate = {};
        if (typeof name !== "undefined") {
            dataToUpdate.name = name;
        }
        if (typeof email !== "undefined") {
            dataToUpdate.email = email;
        }
        if (typeof avatar !== "undefined") {
            dataToUpdate.avatar = avatar;
        }
        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({
                message: "Provide at least one valid field: name, email, or avatar.",
            });
        }
        // ✅ Update user in database
        const updatedUser = await prisma_1.default.user.update({
            where: { id: req.user.id },
            data: dataToUpdate,
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
// Delete user account permanently
const deleteUserAccount = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = req.user.id;
        await prisma_1.default.$transaction(async (tx) => {
            const userOrders = await tx.order.findMany({
                where: { userId },
                select: { id: true },
            });
            const orderIds = userOrders.map((order) => order.id);
            if (orderIds.length > 0) {
                await tx.orderItem.deleteMany({
                    where: { orderId: { in: orderIds } },
                });
            }
            await tx.review.deleteMany({ where: { userId } });
            await tx.loginHistory.deleteMany({ where: { userId } });
            await tx.passwordReset.deleteMany({ where: { userId } });
            await tx.order.deleteMany({ where: { userId } });
            await tx.user.delete({ where: { id: userId } });
        });
        return res.status(200).json({ message: "Account deleted successfully" });
    }
    catch (error) {
        console.error("Delete account error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteUserAccount = deleteUserAccount;
