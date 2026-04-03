import type { Request, Response } from "express";
import { ModifiersService } from "@/modules/modifiers/modifiers.service";
import { getTenantContext } from "@/utils/tenant";
import { sendSuccess } from "@/utils/response";

export class ModifiersController {
  private readonly modifiersService = new ModifiersService();

  createModifier = async (req: Request, res: Response): Promise<void> => {
    const data = await this.modifiersService.createModifier(getTenantContext(req.context), req.body);
    sendSuccess(res, "Modifier created", data, 201);
  };

  getModifiers = async (req: Request, res: Response): Promise<void> => {
    const data = await this.modifiersService.getModifiers(getTenantContext(req.context));
    sendSuccess(res, "Modifiers fetched", data);
  };

  updateModifier = async (req: Request, res: Response): Promise<void> => {
    const data = await this.modifiersService.updateModifier(getTenantContext(req.context), String(req.params.id), req.body);
    sendSuccess(res, "Modifier updated", data);
  };

  deleteModifier = async (req: Request, res: Response): Promise<void> => {
    const data = await this.modifiersService.deleteModifier(getTenantContext(req.context), String(req.params.id));
    sendSuccess(res, "Modifier deleted", data);
  };
}
