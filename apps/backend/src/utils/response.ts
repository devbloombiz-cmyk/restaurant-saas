import type { Response } from "express";
import type { ApiSuccessResponse, ApiErrorResponse } from "@/types/api";

export function sendSuccess<T>(res: Response, message: string, data: T, statusCode = 200): Response<ApiSuccessResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export function sendError(res: Response, message: string, error: unknown, statusCode = 500): Response<ApiErrorResponse> {
  return res.status(statusCode).json({
    success: false,
    message,
    error
  });
}
