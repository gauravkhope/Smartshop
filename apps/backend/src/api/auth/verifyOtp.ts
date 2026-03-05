import { Request, Response } from "express";
import prisma from "../../lib/prisma";

export default async function verifyOtpHandler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, otp } = req.body ?? {};
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "No OTP found. Please register again." });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired. Please register again." });
    }
    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null,
      },
    });
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
