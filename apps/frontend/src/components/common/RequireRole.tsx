import { Navigate, useLocation } from "react-router-dom";
import type { ReactElement } from "react";
import type { UserRole } from "@shared/types/roles";
import { useAppStore } from "@/store/appStore";

export function RequireRole({ allowedRoles, children }: { allowedRoles: UserRole[]; children: ReactElement }) {
  const location = useLocation();
  const currentRole = useAppStore((state) => state.currentRole);
  const tenantId = useAppStore((state) => state.tenantId);
  const shopId = useAppStore((state) => state.shopId);
  const token = localStorage.getItem("accessToken");

  if (!token || !tenantId || !shopId) {
    return <Navigate to="/health" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/pos" replace state={{ from: location.pathname }} />;
  }

  return children;
}
