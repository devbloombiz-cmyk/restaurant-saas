import { appendFileSync, existsSync, mkdirSync, renameSync, statSync, unlinkSync } from "node:fs";
import path from "node:path";
import { env } from "@/config/env";

type LogLevel = "info" | "warn" | "error";

type LoggerPayload = {
  module: string;
  message: string;
  request?: {
    method?: string;
    path?: string;
    ip?: string;
    userId?: string;
  };
  error?: unknown;
  stack?: string;
  tenantId?: string;
  shopId?: string;
  metadata?: Record<string, unknown>;
};

class LoggerService {
  private readonly logDir = path.resolve(process.cwd(), env.LOG_DIR);
  private readonly logFile = path.join(this.logDir, "api.log");

  constructor() {
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }

  private sanitizeValue(value: unknown, depth = 0): unknown {
    if (depth > 3) {
      return "[truncated-depth]";
    }

    if (typeof value === "string") {
      if (value.length <= env.LOG_MAX_FIELD_LENGTH) {
        return value;
      }

      return `${value.slice(0, env.LOG_MAX_FIELD_LENGTH)}...[truncated]`;
    }

    if (Array.isArray(value)) {
      return value.slice(0, 50).map((item) => this.sanitizeValue(item, depth + 1));
    }

    if (value && typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>).slice(0, 50);
      const sanitized: Record<string, unknown> = {};

      entries.forEach(([key, item]) => {
        sanitized[key] = this.sanitizeValue(item, depth + 1);
      });

      return sanitized;
    }

    return value;
  }

  private rotateIfNeeded(nextLineLength: number): void {
    const maxFileSizeBytes = env.LOG_MAX_FILE_SIZE_MB * 1024 * 1024;

    if (existsSync(this.logFile)) {
      const currentSize = statSync(this.logFile).size;

      if (currentSize + nextLineLength < maxFileSizeBytes) {
        return;
      }
    }

    for (let index = env.LOG_MAX_FILES - 1; index >= 1; index -= 1) {
      const source = `${this.logFile}.${index}`;
      const destination = `${this.logFile}.${index + 1}`;

      if (!existsSync(source)) {
        continue;
      }

      if (index + 1 > env.LOG_MAX_FILES) {
        unlinkSync(source);
        continue;
      }

      renameSync(source, destination);
    }

    if (existsSync(this.logFile)) {
      renameSync(this.logFile, `${this.logFile}.1`);
    }
  }

  private write(level: LogLevel, payload: LoggerPayload): void {
    const logLine = {
      level,
      module: payload.module,
      message: payload.message,
      request: this.sanitizeValue(payload.request),
      error: this.sanitizeValue(payload.error),
      stack: payload.stack,
      tenantId: payload.tenantId,
      shopId: payload.shopId,
      metadata: this.sanitizeValue(payload.metadata),
      timestamp: new Date().toISOString()
    };

    const line = `${JSON.stringify(logLine)}\n`;

    this.rotateIfNeeded(line.length);
    appendFileSync(this.logFile, line, "utf8");

    if (level === "error") {
      // eslint-disable-next-line no-console
      console.error(line.trimEnd());
      return;
    }

    if (level === "warn") {
      // eslint-disable-next-line no-console
      console.warn(line.trimEnd());
      return;
    }

    // eslint-disable-next-line no-console
    console.log(line.trimEnd());
  }

  info(payload: LoggerPayload): void {
    this.write("info", payload);
  }

  warn(payload: LoggerPayload): void {
    this.write("warn", payload);
  }

  error(payload: LoggerPayload): void {
    this.write("error", payload);
  }
}

export const Logger = new LoggerService();
