import { NavLink } from "react-router-dom";
import { useAppStore } from "@/store/appStore";

function navClass({ isActive }: { isActive: boolean }): string {
  return `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
  }`;
}

export function TopNav() {
  const role = useAppStore((state) => state.currentRole);

  return (
    <nav className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <NavLink to="/pos" className={navClass}>
        POS
      </NavLink>
      <NavLink to="/pos/operations" className={navClass}>
        Operations
      </NavLink>
      <NavLink to="/admin/menu" className={navClass}>
        Admin Menu
      </NavLink>
      {role === "shop_admin" || role === "super_admin" ? (
        <NavLink to="/admin/settings" className={navClass}>
          Shop Settings
        </NavLink>
      ) : null}
      {role === "shop_admin" || role === "super_admin" ? (
        <NavLink to="/admin/diagnostics" className={navClass}>
          Diagnostics
        </NavLink>
      ) : null}
      {role === "shop_admin" || role === "super_admin" ? (
        <NavLink to="/admin/backup" className={navClass}>
          Backup
        </NavLink>
      ) : null}
      <NavLink to="/reports/daily" className={navClass}>
        Daily Reports
      </NavLink>
      {role === "shop_admin" || role === "super_admin" ? (
        <NavLink to="/future/modules" className={navClass}>
          Future Modules
        </NavLink>
      ) : null}
      {role === "super_admin" ? (
        <NavLink to="/saas/dashboard" className={navClass}>
          SaaS Dashboard
        </NavLink>
      ) : null}
      <NavLink to="/health" className={navClass}>
        Health
      </NavLink>
    </nav>
  );
}
