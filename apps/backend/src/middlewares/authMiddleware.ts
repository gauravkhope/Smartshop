import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    // Verify token
    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err, decoded: any) => {
        if (err) {
          return res.status(403).json({ message: "Invalid or expired token" });
        }

        // Attach user info to request
        req.user = {
          id: Number(decoded.id),
          email: decoded.email,
        };

        next();
      }
    );
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Optional middleware - doesn't block if no token
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next(); // Continue without user
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err, decoded: any) => {
        if (!err && decoded) {
          req.user = {
            id: Number(decoded.id),
            email: decoded.email,
          };
        }
        next();
      }
    );
  } catch (error) {
    next(); // Continue even if error
  }
};
