// apps/frontend/pages/api/verify-password.ts

import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ error: "Missing userId or password" });
  }

  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const response = await axios.post(`${backendUrl}/api/verify-password`, {
      userId,
      password,
    });

    if (response.data.success) {
      return res.status(200).json({ success: true });
    }

    return res.status(401).json({
      success: false,
      error: response.data.error || "Invalid password",
    });
  } catch (err: any) {
    if (err.response) {
      return res.status(err.response.status).json({
        success: false,
        error: err.response.data?.error || "Server error",
      });
    }

    console.error("Password verification error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
