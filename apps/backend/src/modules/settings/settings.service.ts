import { SettingsRepository } from "@/modules/settings/settings.repository";
import type { RequestContext } from "@/types/api";
import { AuditLogService } from "@/services/auditLog.service";
import { cacheService } from "@/services/cache.service";

export class SettingsService {
  private readonly settingsRepository = new SettingsRepository();
  private readonly auditLogService = new AuditLogService();

  async getShopSettings(context: RequestContext) {
    const cacheKey = `shop-settings:${context.tenantId}:${context.shopId}`;
    const cached = cacheService.get<Record<string, unknown>>(cacheKey);

    if (cached) {
      return cached;
    }

    const settings = await this.settingsRepository.getShopSettings(context.tenantId, context.shopId);

    if (!settings) {
      const fallback = {
        shopName: context.shopId,
        currency: "INR",
        timezone: "Asia/Kolkata",
        taxRate: 0,
        receiptFooter: "Thank you for visiting",
        printerDefaults: {},
        logo: "",
        supportNumber: ""
      };

      cacheService.set(cacheKey, fallback, 30_000);
      return fallback;
    }

    cacheService.set(cacheKey, settings, 30_000);
    return settings;
  }

  async updateShopSettings(context: RequestContext, payload: Record<string, unknown>) {
    const settings = await this.settingsRepository.upsertShopSettings(context.tenantId, context.shopId, payload);

    await this.auditLogService.log({
      tenantId: context.tenantId,
      shopId: context.shopId,
      userId: context.userId,
      action: "shop_settings_updated",
      module: "settings",
      metadata: payload
    });

    cacheService.clear(`shop-settings:${context.tenantId}:${context.shopId}`);

    return settings;
  }
}
