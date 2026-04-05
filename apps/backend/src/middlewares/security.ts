import cors from "cors";
import helmet from "helmet";
import type { Express } from "express";
import { env } from "@/config/env";

export function applySecurityMiddleware(app: Express): void {
  const configuredOrigins = env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

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
      origin: (origin, callback) => {
        // Allow server-to-server clients like curl/postman without Origin header.
        if (!origin) {
          callback(null, true);
          return;
        }

        const isConfigured = configuredOrigins.includes(origin);
        const isDevLocalhost = env.NODE_ENV === "development" && /^https?:\/\/localhost(:\d+)?$/i.test(origin);

        if (isConfigured || isDevLocalhost) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true
    })
  );
}
