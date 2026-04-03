import type { Request, Response } from "express";
import { AuthService } from "@/modules/auth/auth.service";
import { sendSuccess } from "@/utils/response";
import { ApiError } from "@/utils/ApiError";

export class AuthController {
  private readonly authService = new AuthService();

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);
    sendSuccess(res, "Login successful", result);
  };

  registerShopAdmin = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.registerShopAdmin(req.body);
    sendSuccess(res, "Shop admin registered successfully", result, 201);
  };

  registerCashier = async (req: Request, res: Response): Promise<void> => {
    if (!req.context) {
      throw new ApiError(401, "Missing request context");
    }

    const result = await this.authService.registerCashier(req.context, req.body);
    sendSuccess(res, "Cashier registered successfully", result, 201);
  };

  profile = async (req: Request, res: Response): Promise<void> => {
    if (!req.context) {
      throw new ApiError(401, "Missing request context");
    }

    const result = await this.authService.profile(req.context);
    sendSuccess(res, "Profile fetched successfully", result);
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.refreshToken(req.body.refreshToken);
    sendSuccess(res, "Token refreshed successfully", result);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.logout(req.body.accessToken, req.body.refreshToken);
    sendSuccess(res, "Logout successful", result);
  };
}
