import express from "express";
import { requestLogger } from "@/middlewares/requestLogger";
import { applySecurityMiddleware } from "@/middlewares/security";
import { registerRoutes } from "@/routes";
import { notFoundHandler } from "@/middlewares/notFound";
import { errorHandler } from "@/middlewares/errorHandler";
import { responseTimeObserver } from "@/middlewares/performance";
import { ipRateLimit } from "@/middlewares/rateLimit";
import { env } from "@/config/env";

export function createApp(): express.Express {
  const app = express();

  applySecurityMiddleware(app);
  app.use(ipRateLimit);
  app.use(responseTimeObserver);
  app.use(requestLogger);
  app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));

  registerRoutes(app);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
