import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("ERROR:", err);

  const status = err.statusCode || 500;

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      details: err.details || null,
    },
    requestId: res.locals.requestId || null,
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  // ...existing code...
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: {
      code: "ROUTE_NOT_FOUND",
      details: null,
    },
    requestId: res.locals.requestId || null,
  });
};
