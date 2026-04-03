import type { Express } from "express";
import { env } from "@/config/env";
import { modulesRouter } from "@/modules";
import { isDatabaseConnected } from "@/config/database";
import { sendSuccess } from "@/utils/response";

export function registerRoutes(app: Express): void {
  app.get(`${env.API_PREFIX}/health`, (_req, res) => {
    sendSuccess(
      res,
      "Health check successful",
      {
        dbConnected: isDatabaseConnected(),
        serverRunning: true,
        timestamp: new Date().toISOString()
      },
      200
    );
  });

  app.use(env.API_PREFIX, modulesRouter);
}
