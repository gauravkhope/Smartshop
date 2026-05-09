import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers["authorization"];
  const fallbackHeader = req.headers["x-access-token"];

  const rawHeader = Array.isArray(authHeader)
    ? authHeader[0]
    : authHeader || (Array.isArray(fallbackHeader) ? fallbackHeader[0] : fallbackHeader);

  if (!rawHeader || typeof rawHeader !== "string") {
    return null;
  }

  const trimmed = rawHeader.trim();
  if (!trimmed) {
    return null;
  }

  // Accept both "Bearer <token>" and raw token strings.
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("bearer ")) {
    return trimmed.slice(7).trim() || null;
  }

  return trimmed;
};

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
    const token = extractToken(req);
    console.log(`[AUTH DEBUG] Extracted token:`, token ? token.slice(0, 10) + '...' : 'NONE');

    if (!token) {
      console.warn('[AUTH DEBUG] No token found in request headers');
      return res.status(401).json({ message: "Access token required" });
    }

    // Verify token
    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err, decoded: any) => {
        if (err) {
          console.warn('[AUTH DEBUG] Invalid or expired token:', err.message);
          return res.status(403).json({ message: "Invalid or expired token" });
        }

        // Attach user info to request
        req.user = {
          id: Number(decoded.id),
          email: decoded.email,
        };
        console.log(`[AUTH DEBUG] Authenticated user:`, req.user);
        next();
      }
    );
  } catch (error) {
    console.error("[AUTH DEBUG] Auth middleware error:", error);
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
    const token = extractToken(req);

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
