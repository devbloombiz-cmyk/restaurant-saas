import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default("/api"),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  JWT_BLACKLIST_ENABLED: z.coerce.boolean().default(true),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(200),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().default(8),
  REQUEST_BODY_LIMIT: z.string().default("1mb"),
  BACKUP_DIR: z.string().default("backups"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
  SUPER_ADMIN_NAME: z.string().default("Platform Super Admin"),
  SUPER_ADMIN_EMAIL: z.string().email().default("superadmin@restaurant-saas.local"),
  SUPER_ADMIN_PASSWORD: z.string().min(8).default("SuperAdmin@123")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;
