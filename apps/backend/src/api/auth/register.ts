import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordResetCodeEmail } from "../../services/emailService";

export default async function registerHandler(
  req: Request,
  res: Response
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, password } = req.body ?? {};

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    // Step 1/2: If password is not provided, create user with name/email and send OTP
    if (!password) {
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          otp,
          otpExpiry,
          isVerified: false,
          password: "", // Set to empty string since password is required by schema
        },
      });
      sendPasswordResetCodeEmail(newUser.email, newUser.name, otp).catch((error) => {
        console.error("Failed to send OTP email:", error);
      });
      return res.status(201).json({
        message: "OTP sent to email. Please verify.",
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
      });
    }

    // Step 4: Set password after verification
    if (!existingUser) {
      return res.status(404).json({ message: "User not found. Please start registration." });
    }
    if (!existingUser.isVerified) {
      return res.status(400).json({ message: "Email not verified. Please verify OTP first." });
    }
    if (existingUser.password) {
      return res.status(400).json({ message: "Password already set. Account exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    return res.status(200).json({ message: "Account created successfully!" });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}