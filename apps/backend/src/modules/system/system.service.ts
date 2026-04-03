import type { RequestContext } from "@/types/api";
import { SystemRepository } from "@/modules/system/system.repository";
import { metricsService } from "@/services/metrics.service";
import { Logger } from "@/services/logger.service";
import { UserModel } from "@/models/user.model";

export class SystemService {
  private readonly systemRepository = new SystemRepository();

  async health() {
    const dbLatencyMs = await metricsService.getDbLatencyMs();

    return {
      status: dbLatencyMs >= 0 ? "ok" : "degraded",
      dbLatencyMs,
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  async metrics() {
    const dbLatencyMs = await metricsService.getDbLatencyMs();
    const systemSnapshot = metricsService.getSystemSnapshot();
    const activeSessions = await UserModel.countDocuments({ refreshTokenHash: { $ne: null }, isActive: true });

    return {
      dbLatencyMs,
      apiResponseTimeMs: metricsService.getAverageResponseTimeMs(),
      memoryUsage: systemSnapshot.memoryUsage,
      cpuUsage: {
        loadAverage: systemSnapshot.cpuLoad,
        cpuCount: systemSnapshot.cpuCount
      },
      uptimeSeconds: systemSnapshot.uptimeSeconds,
      activeSessions
    };
  }

  async diagnostics() {
    const [health, metrics] = await Promise.all([this.health(), this.metrics()]);

    return {
      health,
      metrics,
      nodeEnv: process.env.NODE_ENV,
      pid: process.pid
    };
  }

  async backup(context: RequestContext) {
    const result = await this.systemRepository.createBackupSnapshot(context.tenantId, context.shopId);

    Logger.info({
      module: "system",
      message: "Backup created",
      tenantId: context.tenantId,
      shopId: context.shopId,
      metadata: { fileName: result.fileName }
    });

    return result;
  }

  async restore(context: RequestContext, fileName: string) {
    await this.systemRepository.restoreFromBackup(context.tenantId, context.shopId, fileName);

    Logger.warn({
      module: "system",
      message: "Restore executed",
      tenantId: context.tenantId,
      shopId: context.shopId,
      metadata: { fileName }
    });

    return { restoredFrom: fileName };
  }

  async listBackups() {
    return this.systemRepository.listBackups();
  }

  async getBackupFilePath(fileName: string) {
    return this.systemRepository.getBackupFilePath(fileName);
  }
}
