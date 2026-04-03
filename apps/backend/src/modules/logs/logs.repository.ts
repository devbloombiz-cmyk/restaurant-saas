import { AuditLogModel } from "@/models/auditLog.model";

export class LogsRepository {
  async findAll(tenantId: string, shopId: string) {
    return AuditLogModel.find({ tenantId, shopId }).sort({ timestamp: -1 }).limit(500);
  }

  async findById(id: string, tenantId: string, shopId: string) {
    return AuditLogModel.findOne({ _id: id, tenantId, shopId });
  }
}
