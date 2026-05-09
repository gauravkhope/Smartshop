import { Response } from "express";

export const sendSuccess = (
  res: Response,
  message: string,
  data: unknown = null,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    requestId: res.locals.requestId || null,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  code: string,
  details?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details: details ?? null,
    },
    requestId: res.locals.requestId || null,
  });
};
