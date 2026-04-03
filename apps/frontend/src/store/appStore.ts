import { create } from "zustand";
import type { UserRole } from "@shared/types/roles";

type AppStoreState = {
  tenantId: string | null;
  shopId: string | null;
  currentRole: UserRole;
  setTenantContext: (tenantId: string, shopId: string) => void;
  setCurrentRole: (role: UserRole) => void;
  resetSession: () => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  tenantId: localStorage.getItem("tenantId"),
  shopId: localStorage.getItem("shopId"),
  currentRole: (localStorage.getItem("currentRole") as UserRole | null) ?? "cashier",
  setTenantContext: (tenantId, shopId) => {
    localStorage.setItem("tenantId", tenantId);
    localStorage.setItem("shopId", shopId);
    set({ tenantId, shopId });
  },
  setCurrentRole: (currentRole) => {
    localStorage.setItem("currentRole", currentRole);
    set({ currentRole });
  },
  resetSession: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tenantId");
    localStorage.removeItem("shopId");
    set({ tenantId: null, shopId: null, currentRole: "cashier" });
  }
}));
