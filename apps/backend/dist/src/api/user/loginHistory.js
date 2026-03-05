"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoginHistory = void 0;
// Get login history for current user
const getLoginHistory = async (req, res) => {
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
        const history = [];
        return res.status(200).json({ history });
    }
    catch (error) {
        console.error("Get login history error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getLoginHistory = getLoginHistory;
