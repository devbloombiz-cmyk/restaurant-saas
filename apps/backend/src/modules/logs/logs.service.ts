import type { RequestContext } from "@/types/api";
import { LogsRepository } from "@/modules/logs/logs.repository";
import { ApiError } from "@/utils/ApiError";

export class LogsService {
  private readonly logsRepository = new LogsRepository();

  async getLogs(context: RequestContext) {
    return this.logsRepository.findAll(context.tenantId, context.shopId);
  }

  async getLogById(context: RequestContext, id: string) {
    const log = await this.logsRepository.findById(id, context.tenantId, context.shopId);

    if (!log) {
      throw new ApiError(404, "Log entry not found");
    }

    return log;
  }
}
