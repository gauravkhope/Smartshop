import { Request, Response } from "express";
import prisma from "../../lib/prisma";

// Get login history for current user
export const getLoginHistory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // TODO: Uncomment after running 'npx prisma generate'
    // const history = await prisma.loginHistory.findMany({
    //   where: { userId: req.user.id },
    //   orderBy: { loginAt: "desc" },
    //   take: 20, // Limit to last 20 logins
    // });

    // Temporary: Return empty array until Prisma client is regenerated
    const history: any[] = [];

    return res.status(200).json({ history });
  } catch (error) {
    console.error("Get login history error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
