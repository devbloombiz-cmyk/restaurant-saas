import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import type { UserRole } from "@shared/types/roles";

export function SessionSetupCard() {
  const [tokenInput, setTokenInput] = useState(() => localStorage.getItem("accessToken") ?? "");
  const [refreshTokenInput, setRefreshTokenInput] = useState(() => localStorage.getItem("refreshToken") ?? "");
  const [tenantInput, setTenantInput] = useState(() => localStorage.getItem("tenantId") ?? "platform");
  const [shopInput, setShopInput] = useState(() => localStorage.getItem("shopId") ?? "platform");
  const [roleInput, setRoleInput] = useState<UserRole>(() => (localStorage.getItem("currentRole") as UserRole | null) ?? "cashier");
  const setTenantContext = useAppStore((state) => state.setTenantContext);
  const setCurrentRole = useAppStore((state) => state.setCurrentRole);

  function saveSession(): void {
    localStorage.setItem("accessToken", tokenInput);
    localStorage.setItem("refreshToken", refreshTokenInput);
    localStorage.setItem("tenantId", tenantInput);
    localStorage.setItem("shopId", shopInput);
    localStorage.setItem("currentRole", roleInput);
    setTenantContext(tenantInput, shopInput);
    setCurrentRole(roleInput);
  }

  return (
    <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Session Setup</h2>
      <p className="mb-3 mt-1 text-xs text-slate-500">Set token and tenant/shop context for authenticated API calls.</p>
      <div className="grid gap-2 md:grid-cols-5">
        <input
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Access token"
          value={tokenInput}
          onChange={(event) => setTokenInput(event.target.value)}
        />
        <input
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Refresh token"
          value={refreshTokenInput}
          onChange={(event) => setRefreshTokenInput(event.target.value)}
        />
        <input
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="tenantId"
          value={tenantInput}
          onChange={(event) => setTenantInput(event.target.value)}
        />
        <input
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="shopId"
          value={shopInput}
          onChange={(event) => setShopInput(event.target.value)}
        />
        <select
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={roleInput}
          onChange={(event) => setRoleInput(event.target.value as UserRole)}
        >
          <option value="cashier">cashier</option>
          <option value="shop_admin">shop_admin</option>
          <option value="super_admin">super_admin</option>
        </select>
      </div>
      <button className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-sm text-white" onClick={saveSession} type="button">
        Save Session
      </button>
    </section>
  );
}
