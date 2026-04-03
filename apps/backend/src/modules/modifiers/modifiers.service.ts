import { ApiError } from "@/utils/ApiError";
import { ModifiersRepository } from "@/modules/modifiers/modifiers.repository";
import type { RequestContext } from "@/types/api";

export class ModifiersService {
  private readonly modifiersRepository = new ModifiersRepository();

  async createModifier(context: RequestContext, body: Record<string, unknown>) {
    return this.modifiersRepository.create({
      tenantId: context.tenantId,
      shopId: context.shopId,
      itemId: String(body.itemId),
      name: String(body.name),
      priceAdjustment: Number(body.priceAdjustment),
      type: body.type as "add" | "remove"
    });
  }

  async getModifiers(context: RequestContext) {
    return this.modifiersRepository.findAll(context.tenantId, context.shopId);
  }

  async updateModifier(context: RequestContext, id: string, body: Record<string, unknown>) {
    const modifier = await this.modifiersRepository.updateById(id, context.tenantId, context.shopId, body);

    if (!modifier) {
      throw new ApiError(404, "Modifier not found");
    }

    return modifier;
  }

  async deleteModifier(context: RequestContext, id: string) {
    const modifier = await this.modifiersRepository.deleteById(id, context.tenantId, context.shopId);

    if (!modifier) {
      throw new ApiError(404, "Modifier not found");
    }

    return { id: modifier.id };
  }
}
