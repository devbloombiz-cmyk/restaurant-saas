import { NavLink, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { logout } from "@/services/authService";
import { useToastStore } from "@/store/toastStore";

function navClass({ isActive }: { isActive: boolean }): string {
  return `rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-gradient-to-r from-teal-700 to-teal-800 text-white shadow-md"
      : "border border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-900"
  }`;
}

export function TopNav() {
  const navigate = useNavigate();
  const role = useAppStore((state) => state.currentRole);
  const currentUserName = useAppStore((state) => state.currentUserName);
  const resetSession = useAppStore((state) => state.resetSession);
  const pushToast = useToastStore((state) => state.pushToast);

  const isCashier = role === "cashier";
  const isShopAdmin = role === "shop_admin";
  const isSuperAdmin = role === "super_admin";

  const roleLabel =
    role === "super_admin"
      ? "Super Admin"
      : role === "shop_admin"
      ? "Shop Admin"
      : "Order Taker / Counter Staff";

  async function onLogout(): Promise<void> {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (accessToken && refreshToken) {
        await logout({ accessToken, refreshToken });
      }
    } catch {
      // UI session cleanup should continue even if logout call fails.
    } finally {
      resetSession();
      navigate("/login", { replace: true });
      pushToast({ type: "info", message: "Logged out successfully." });
    }
  }

  return (
    <nav className="app-card mb-4 flex flex-wrap items-center gap-2 p-3 md:p-4">
      {isCashier ? (
        <NavLink to="/pos" className={navClass}>
          POS
        </NavLink>
      ) : null}
      {isShopAdmin ? (
        <NavLink to="/admin/menu" className={navClass}>
          Admin Menu
        </NavLink>
      ) : null}
      {isShopAdmin ? (
        <NavLink to="/admin/settings" className={navClass}>
          Shop Settings
        </NavLink>
      ) : null}
      {isShopAdmin || isSuperAdmin ? (
        <NavLink to="/admin/diagnostics" className={navClass}>
          Diagnostics
        </NavLink>
      ) : null}
      {isShopAdmin || isSuperAdmin ? (
        <NavLink to="/admin/backup" className={navClass}>
          Backup
        </NavLink>
      ) : null}
      {isShopAdmin ? (
        <NavLink to="/reports/daily" className={navClass}>
          Daily Reports
        </NavLink>
      ) : null}
      {isSuperAdmin ? (
        <NavLink to="/super-admin/onboard" className={navClass}>
          Onboard Shop
        </NavLink>
      ) : null}
      {isSuperAdmin ? (
        <NavLink to="/future/modules" className={navClass}>
          Future Modules
        </NavLink>
      ) : null}
      {isSuperAdmin ? (
        <NavLink to="/saas/dashboard" className={navClass}>
          SaaS Dashboard
        </NavLink>
      ) : null}
      <span className="ml-auto rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
        {currentUserName ? `Signed in: ${currentUserName} (${roleLabel})` : roleLabel}
      </span>
      <button
        type="button"
        className="app-btn-ghost rounded-xl px-3 py-2 text-xs font-semibold"
        onClick={() => {
          void onLogout();
        }}
      >
        Logout
      </button>
    </nav>
  );
}
