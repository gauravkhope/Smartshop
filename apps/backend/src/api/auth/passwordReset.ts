import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordResetCodeEmail } from "../../services/emailService";
import {
  storePasswordResetCode,
  getPasswordResetData,
  verifyPasswordResetCode,
  markPasswordResetVerified,
  deletePasswordResetCode,
} from "../../lib/redis";

// Generate 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Find user
async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
  });
}

//
// ✅ 1. FORGOT PASSWORD (SEND CODE)
//
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || "").trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "This EMail not Registered . Please Register First...",
      });
    }

    const code = generateCode();

    await storePasswordResetCode(email, user.id, code);

    try {
      await sendPasswordResetCodeEmail(user.email, user.name, code);
    } catch (error) {
      console.error("Email error:", error);
      return res.status(500).json({ message: "Failed to send code" });
    }

    return res.status(200).json({
      message: "If an account exists, you will receive a code.",
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//
// ✅ 2. VERIFY CODE (STEP 2)
//
export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const normalizedEmail = String(email || "").trim();

    if (!normalizedEmail || !code) {
      return res.status(400).json({ message: "Email and code required" });
    }

    const redisData = await getPasswordResetData(normalizedEmail);

    if (!redisData) {
      return res.status(400).json({
        message: "Code expired or not found",
      });
    }

    const isValid = await verifyPasswordResetCode(normalizedEmail, code);

    if (!isValid) {
      return res.status(400).json({
        message: "Invalid code",
      });
    }

    // ✅ Mark verified
    await markPasswordResetVerified(normalizedEmail);

    return res.status(200).json({
      message: "Code verified successfully",
    });

  } catch (error) {
    console.error("Verify code error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//
// ✅ 3. RESET PASSWORD (FINAL STEP)
//
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = String(email || "").trim();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const resetData = await getPasswordResetData(normalizedEmail);

    if (!resetData) {
      return res.status(400).json({
        message: "Reset session expired",
      });
    }

    if (!resetData.verified) {
      return res.status(400).json({
        message: "Please verify code first",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: resetData.userId },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: resetData.userId },
      data: { password: hashedPassword },
    });

    // ✅ Cleanup
    await deletePasswordResetCode(normalizedEmail);

    return res.status(200).json({
      message: "Password reset successful",
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Backward-compatible exports for existing routes/frontend usage.
export const verifyCode = verifyResetCode;
export const resetPasswordWithCode = resetPassword;