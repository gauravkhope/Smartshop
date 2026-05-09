import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { sendRegistrationOtpEmail } from "../../services/emailService";
import {
  storeOtp,
  getOtpData,
  deleteOtp,
  checkRateLimit,
  checkBlocked,
} from "../../lib/redis";

export default async function registerHandler(
  req: Request,
  res: Response
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, password } = req.body ?? {};
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // ✅ STEP 1: Send OTP
    if (!password) {
      const normalizedName = String(name || "").trim();
      if (!normalizedName) {
        return res.status(400).json({ message: "Name and email are required" });
      }

      if (existingUser) {
        return res.status(400).json({ message: "This email is already registered" });
      }

      const blocked = await checkBlocked(normalizedEmail);
      if (blocked) {
        return res.status(429).json({
          message: "Too many failed attempts. Try again after 10 minutes.",
        });
      }

      const rateLimit = await checkRateLimit(normalizedEmail);
      if (!rateLimit.allowed) {
        return res.status(429).json({
          message: "Too many OTP requests. Please try again later.",
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await storeOtp(normalizedEmail, normalizedName, otp);

      try {
        await sendRegistrationOtpEmail(normalizedEmail, normalizedName, otp);
      } catch (error) {
        console.error("Failed to send OTP email:", error);
        return res.status(500).json({ message: "Failed to send OTP" });
      }

      return res.status(200).json({
        message: "Register OTP sent successfully.",
      });
    }

    // ✅ STEP 3: Create user AFTER verification
    if (existingUser) {
      return res.status(400).json({ message: "This email is already registered" });
    }

    const otpData = await getOtpData(normalizedEmail);

    if (!otpData) {
      return res.status(400).json({ message: "OTP expired or not requested." });
    }

    if (!otpData.verified) {
      return res.status(400).json({ message: "Please verify OTP first." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: otpData.name,
        email: normalizedEmail,
        password: hashedPassword,
        isVerified: true,
      },
    });

    // ✅ Cleanup OTP
    await deleteOtp(normalizedEmail);

    return res.status(200).json({
      message: "Account created successfully!",
    });

  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}