import { SaasRepository } from "@/modules/saas/saas.repository";
import { ApiError } from "@/utils/ApiError";

export class SaasService {
  private readonly saasRepository = new SaasRepository();

  async getTenants() {
    return this.saasRepository.getTenants();
  }

  async getShops() {
    return this.saasRepository.getShops();
  }

  async updateTenantStatus(id: string, isActive: boolean) {
    const tenant = await this.saasRepository.updateTenantStatus(id, isActive);

    if (!tenant) {
      throw new ApiError(404, "Tenant not found");
    }

    return tenant;
  }

  async updateShopStatus(id: string, isActive: boolean) {
    const shop = await this.saasRepository.updateShopStatus(id, isActive);

    if (!shop) {
      throw new ApiError(404, "Shop not found");
    }

    return shop;
  }

  async platformSummary() {
    return this.saasRepository.platformSummary();
  }
}
