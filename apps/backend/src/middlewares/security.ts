import cors from "cors";
import helmet from "helmet";
import type { Express } from "express";
import { env } from "@/config/env";

export function applySecurityMiddleware(app: Express): void {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", "https:", "data:"],
          imgSrc: ["'self'", "data:", "https:"],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:"]
        }
      }
    })
  );
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
}
