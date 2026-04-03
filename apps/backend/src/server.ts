import { createApp } from "@/app";
import { connectDatabase } from "@/config/database";
import { env } from "@/config/env";
import mongoose from "mongoose";
import { ensureSuperAdminSeed } from "@/config/seed";
import { tokenBlacklistService } from "@/services/tokenBlacklist.service";

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await ensureSuperAdminSeed();

  const app = createApp();
  const blacklistSweep = setInterval(() => {
    tokenBlacklistService.purgeExpired();
  }, 60_000);

  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${env.PORT}`);
  });

  const shutdown = async (): Promise<void> => {
    clearInterval(blacklistSweep);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to bootstrap backend", error);
  process.exit(1);
});
