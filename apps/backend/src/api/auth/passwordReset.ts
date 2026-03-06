import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordResetCodeEmail } from "../../services/emailService";

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

// Request password reset - Send verification code
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || "").trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await findUserByEmail(email);

    // Don't reveal if user exists for security
    if (!user) {
      return res.status(200).json({
        message: "If an account exists with this email, you will receive a verification code.",
      });
    }

    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 600000); // 10 minutes

    // Persist code in database so verification works across restarts/instances.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp: verificationCode,
        otpExpiry: expiresAt,
      },
    });

    // Send verification code email
    try {
      await sendPasswordResetCodeEmail(user.email, user.name, verificationCode);
      console.log(`Verification code sent to ${email}`);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return res.status(500).json({ message: "Failed to send verification code. Please check email configuration." });
    }

    return res.status(200).json({
      message: "If an account exists with this email, you will receive a verification code.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Verify code and reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({ message: "Email, verification code, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = String(email || "").trim();
    const user = await findUserByEmail(normalizedEmail);

    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Check if expired
    if (new Date() > user.otpExpiry) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otp: null, otpExpiry: null },
      });
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Verify code
    if (String(user.otp).trim() !== String(code).trim()) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, otp: null, otpExpiry: null },
    });

    console.log(`Password reset successful for user ID: ${user.id}`);

    return res.status(200).json({
      message: "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Verify code only (without resetting password)
export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const normalizedEmail = String(email || "").trim();
    const user = await findUserByEmail(normalizedEmail);

    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    if (new Date() > user.otpExpiry) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otp: null, otpExpiry: null },
      });
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Trim and compare as strings
    const receivedCode = String(code).trim();
    const storedCode = String(user.otp).trim();

    if (storedCode !== receivedCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    return res.status(200).json({ message: "Code verified successfully" });
  } catch (error) {
    console.error("Verify code error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Reset password with verification code
export const resetPasswordWithCode = async (req: Request, res: Response) => {
  try {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({ message: "Email, code, and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const normalizedEmail = String(email || "").trim();
    const user = await findUserByEmail(normalizedEmail);

    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    if (new Date() > user.otpExpiry) {
      await prisma.user.update({
        where: { id: user.id },
        data: { otp: null, otpExpiry: null },
      });
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Trim and compare as strings
    const receivedCode = String(code).trim();
    const storedCode = String(user.otp).trim();

    if (storedCode !== receivedCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, otp: null, otpExpiry: null },
    });

    console.log(`Password reset successful for user ID: ${user.id}`);

    return res.status(200).json({
      message: "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password with code error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
