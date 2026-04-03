import { UsersRepository } from "@/modules/users/users.repository";
import { ApiError } from "@/utils/ApiError";
import { hashValue } from "@/utils/crypto";
import type { RequestContext } from "@/types/api";
import { AuditLogService } from "@/services/auditLog.service";

export class UsersService {
  private readonly usersRepository = new UsersRepository();
  private readonly auditLogService = new AuditLogService();

  async createCashier(context: RequestContext, body: Record<string, unknown>) {
    const existing = await this.usersRepository.findCashierByEmail(String(body.email), context.tenantId, context.shopId);

    if (existing) {
      throw new ApiError(409, "Cashier email already exists");
    }

    const password = await hashValue(String(body.password));

    const cashier = await this.usersRepository.createCashier({
      tenantId: context.tenantId,
      shopId: context.shopId,
      name: String(body.name),
      email: String(body.email).toLowerCase(),
      password,
      role: "cashier"
    });

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "cashier_created",
      module: "users",
      metadata: { cashierId: cashier.id, cashierEmail: cashier.email }
    });

    return cashier;
  }

  async getCashiers(context: RequestContext) {
    return this.usersRepository.findCashiers(context.tenantId, context.shopId);
  }

  async updateCashier(context: RequestContext, id: string, body: Record<string, unknown>) {
    const payload: Record<string, unknown> = { ...body };

    if (typeof body.password === "string") {
      payload.password = await hashValue(body.password);
    }

    const cashier = await this.usersRepository.updateCashier(id, context.tenantId, context.shopId, payload);

    if (!cashier) {
      throw new ApiError(404, "Cashier not found");
    }

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "cashier_updated",
      module: "users",
      metadata: { cashierId: cashier.id }
    });

    return cashier;
  }

  async deleteCashier(context: RequestContext, id: string) {
    const cashier = await this.usersRepository.deleteCashier(id, context.tenantId, context.shopId);

    if (!cashier) {
      throw new ApiError(404, "Cashier not found");
    }

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "cashier_deleted",
      module: "users",
      metadata: { cashierId: cashier.id }
    });

    return { id: cashier.id };
  }
}
