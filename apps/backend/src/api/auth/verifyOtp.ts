import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import {
  getOtpData,
  verifyOtp as verifyOtpFromRedis,
  markOtpVerified,
  checkBlocked,
} from "../../lib/redis";

export default async function verifyOtpHandler(
  req: Request,
  res: Response
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, otp } = req.body ?? {};
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail || !otp) {
    return res.status(400).json({
      message: "Email and OTP are required",
    });
  }

  try {
    const blocked = await checkBlocked(normalizedEmail);
    if (blocked) {
      return res.status(429).json({
        message: "Too many failed attempts. Try again after 10 minutes.",
      });
    }

    // ✅ Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "This email is already registered",
      });
    }

    // ✅ Check if OTP exists first (better clarity)
    const redisData = await getOtpData(normalizedEmail);

    if (!redisData) {
      return res.status(400).json({
        message: "OTP expired or not found. Please request again.",
      });
    }

    // ✅ Verify OTP with attempts and blocking
    const verificationResult = await verifyOtpFromRedis(normalizedEmail, otp);

    if (verificationResult.status === "blocked") {
      return res.status(429).json({
        message: "Too many failed attempts. Try again after 10 minutes.",
      });
    }

    if (verificationResult.status === "max_attempts") {
      return res.status(429).json({
        message: "Maximum attempts exceeded. Please request a new OTP.",
      });
    }

    if (verificationResult.status === "already_used") {
      return res.status(400).json({
        message: "OTP already used. Please continue registration or request a new OTP.",
      });
    }

    if (verificationResult.status === "invalid") {
      return res.status(400).json({
        message: "Invalid OTP",
        remainingAttempts: verificationResult.remainingAttempts,
      });
    }

    if (verificationResult.status === "not_found") {
      return res.status(400).json({
        message: "OTP expired or not found. Please request again.",
      });
    }

    if (!verificationResult.otpData) {
      return res.status(400).json({
        message: "OTP expired or not found. Please request again.",
      });
    }

    // ✅ Mark OTP as verified
    await markOtpVerified(normalizedEmail);

    return res.status(200).json({
      message: "Email verified successfully",
    });

  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}