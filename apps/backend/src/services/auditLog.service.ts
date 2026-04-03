import { AuditLogModel } from "@/models/auditLog.model";

export class AuditLogService {
  async log(payload: {
    tenantId: string;
    shopId: string;
    userId: string;
    action: string;
    module: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await AuditLogModel.create({
        tenantId: payload.tenantId,
        shopId: payload.shopId,
        userId: payload.userId,
        action: payload.action,
        module: payload.module,
        metadata: payload.metadata ?? {},
        timestamp: new Date()
      });
    } catch {
      // Logging should not break primary business flow.
    }
  }
}
