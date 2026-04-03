import type { UserRole } from "@shared/types/roles";

declare global {
  namespace Express {
    interface Request {
      context?: {
        tenantId: string;
        shopId: string;
        role: UserRole;
        userId: string;
      };
    }
  }
}

export {};
