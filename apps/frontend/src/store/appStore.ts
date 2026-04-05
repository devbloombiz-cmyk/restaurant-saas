import { create } from "zustand";
import type { UserRole } from "@shared/types/roles";
import type { AuthUser, SessionDetails } from "@/services/authService";
import { clearClientSessionArtifacts } from "@/services/sessionCleanup";

type AppStoreState = {
  tenantId: string | null;
  shopId: string | null;
  currentRole: UserRole;
  currentUserName: string | null;
  currentUserEmail: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  setSession: (payload: { accessToken: string; refreshToken: string; user: AuthUser; session?: SessionDetails }) => void;
  hydrateSession: (session: SessionDetails) => void;
  setTenantContext: (tenantId: string, shopId: string) => void;
  setCurrentRole: (role: UserRole) => void;
  resetSession: () => void;
};

export const useAppStore = create<AppStoreState>((set) => ({
  tenantId: localStorage.getItem("tenantId"),
  shopId: localStorage.getItem("shopId"),
  currentRole: (localStorage.getItem("currentRole") as UserRole | null) ?? "cashier",
  currentUserName: localStorage.getItem("currentUserName"),
  currentUserEmail: localStorage.getItem("currentUserEmail"),
  permissions: JSON.parse(localStorage.getItem("permissions") ?? "[]") as string[],
  isAuthenticated: Boolean(localStorage.getItem("accessToken")),
  setSession: ({ accessToken, refreshToken, user, session }) => {
    const effectiveUser = session?.user ?? user;
    const permissions = session?.permissions ?? [];
    const sessionCurrency = session?.activeShop?.currency;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("tenantId", effectiveUser.tenantId);
    localStorage.setItem("shopId", effectiveUser.shopId);
    localStorage.setItem("currentRole", effectiveUser.role);
    localStorage.setItem("currentUserName", effectiveUser.name);
    localStorage.setItem("currentUserEmail", effectiveUser.email);
    localStorage.setItem("permissions", JSON.stringify(permissions));
    if (typeof sessionCurrency === "string" && sessionCurrency.trim().length > 0) {
      localStorage.setItem("currency", sessionCurrency.toUpperCase());
    }

    set({
      tenantId: effectiveUser.tenantId,
      shopId: effectiveUser.shopId,
      currentRole: effectiveUser.role,
      currentUserName: effectiveUser.name,
      currentUserEmail: effectiveUser.email,
      permissions,
      isAuthenticated: true
    });
  },
  hydrateSession: (session) => {
    const sessionCurrency = session.activeShop?.currency;

    localStorage.setItem("tenantId", session.user.tenantId);
    localStorage.setItem("shopId", session.user.shopId);
    localStorage.setItem("currentRole", session.user.role);
    localStorage.setItem("currentUserName", session.user.name);
    localStorage.setItem("currentUserEmail", session.user.email);
    localStorage.setItem("permissions", JSON.stringify(session.permissions));
    if (typeof sessionCurrency === "string" && sessionCurrency.trim().length > 0) {
      localStorage.setItem("currency", sessionCurrency.toUpperCase());
    }

    set({
      tenantId: session.user.tenantId,
      shopId: session.user.shopId,
      currentRole: session.user.role,
      currentUserName: session.user.name,
      currentUserEmail: session.user.email,
      permissions: session.permissions,
      isAuthenticated: true
    });
  },
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
    clearClientSessionArtifacts();
    set({
      tenantId: null,
      shopId: null,
      currentRole: "cashier",
      currentUserName: null,
      currentUserEmail: null,
      permissions: [],
      isAuthenticated: false
    });
  }
}));
