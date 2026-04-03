import os from "node:os";
import mongoose from "mongoose";

class MetricsService {
  private requestCount = 0;
  private cumulativeResponseTimeMs = 0;

  observeResponseTime(durationMs: number): void {
    this.requestCount += 1;
    this.cumulativeResponseTimeMs += durationMs;
  }

  getAverageResponseTimeMs(): number {
    if (this.requestCount === 0) {
      return 0;
    }

    return Number((this.cumulativeResponseTimeMs / this.requestCount).toFixed(2));
  }

  async getDbLatencyMs(): Promise<number> {
    const db = mongoose.connection.db;

    if (!db) {
      return -1;
    }

    const startedAt = performance.now();
    await db.admin().ping();
    return Number((performance.now() - startedAt).toFixed(2));
  }

  getSystemSnapshot() {
    return {
      memoryUsage: process.memoryUsage(),
      cpuLoad: os.loadavg(),
      cpuCount: os.cpus().length,
      uptimeSeconds: process.uptime(),
      freeMemoryBytes: os.freemem(),
      totalMemoryBytes: os.totalmem()
    };
  }
}

export const metricsService = new MetricsService();
