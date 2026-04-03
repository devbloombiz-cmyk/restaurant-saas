import type { NextFunction, Request, Response } from "express";
import { metricsService } from "@/services/metrics.service";

export function responseTimeObserver(req: Request, res: Response, next: NextFunction): void {
  const startedAt = performance.now();

  res.on("finish", () => {
    const duration = performance.now() - startedAt;
    metricsService.observeResponseTime(duration);
  });

  next();
}
