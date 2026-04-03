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
  private write(level: LogLevel, payload: LoggerPayload): void {
    const logLine = {
      level,
      module: payload.module,
      message: payload.message,
      request: payload.request,
      error: payload.error,
      stack: payload.stack,
      tenantId: payload.tenantId,
      shopId: payload.shopId,
      metadata: payload.metadata,
      timestamp: new Date().toISOString()
    };

    const line = JSON.stringify(logLine);

    if (level === "error") {
      // eslint-disable-next-line no-console
      console.error(line);
      return;
    }

    if (level === "warn") {
      // eslint-disable-next-line no-console
      console.warn(line);
      return;
    }

    // eslint-disable-next-line no-console
    console.log(line);
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
