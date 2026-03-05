// apps/frontend/pages/api/update-password.ts
import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Missing required fields" });
  }

  try {
    const url = `${API_BASE_URL}/api/update-password`;

    const response = await axios.post(url, {
      userId,
      currentPassword,
      newPassword,
    });

    // Ensure safe access to response.data
    const data = response?.data || {};

    if (data.success) {
      return res.status(200).json({ success: true });
    }

    return res.status(401).json({
      success: false,
      error: data.error || "Invalid credentials",
    });
  } catch (err: any) {
    if (err?.response) {
      const status = err.response.status || 500;
      const backendError =
        err.response.data?.error || "Server error";

      return res.status(status).json({
        success: false,
        error: backendError,
      });
    }

    console.error("Password update error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}
