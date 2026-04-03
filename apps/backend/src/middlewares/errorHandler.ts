import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "@/utils/ApiError";
import { sendError } from "@/utils/response";
import { Logger } from "@/services/logger.service";

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ZodError) {
    Logger.warn({
      module: "validation",
      message: "Validation failed",
      request: { method: req.method, path: req.path, ip: req.ip, userId: req.context?.userId },
      tenantId: req.context?.tenantId,
      shopId: req.context?.shopId,
      metadata: { issues: error.issues }
    });
    sendError(res, "Validation failed", { issues: error.issues }, 400);
    return;
  }

  if (error instanceof ApiError) {
    Logger.warn({
      module: "api",
      message: error.message,
      request: { method: req.method, path: req.path, ip: req.ip, userId: req.context?.userId },
      tenantId: req.context?.tenantId,
      shopId: req.context?.shopId,
      metadata: { details: error.details, statusCode: error.statusCode }
    });
    sendError(res, error.message, error.details ?? {}, error.statusCode);
    return;
  }

  Logger.error({
    module: "api",
    message: "Unhandled error",
    request: { method: req.method, path: req.path, ip: req.ip, userId: req.context?.userId },
    error,
    stack: error instanceof Error ? error.stack : undefined,
    tenantId: req.context?.tenantId,
    shopId: req.context?.shopId
  });

  sendError(res, "Internal server error", {}, 500);
}
