import { useAppStore } from "@/store/appStore";

export function HealthPage() {
  const role = useAppStore((state) => state.currentRole);
  const tenantId = useAppStore((state) => state.tenantId);
  const shopId = useAppStore((state) => state.shopId);
  const roleLabel = role === "super_admin" ? "Super Admin" : role === "shop_admin" ? "Shop Admin" : "Order Taker / Counter Staff";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-xl font-semibold">System Health</h1>
      <p className="mt-2 text-sm text-slate-600">Frontend foundation is active for POS and admin workflows.</p>
      <ul className="mt-4 space-y-1 text-sm text-slate-700">
        <li>Current role: {roleLabel}</li>
        <li>Tenant: {tenantId ?? "not set"}</li>
        <li>Shop: {shopId ?? "not set"}</li>
        <li>API target: {import.meta.env.VITE_API_BASE_URL}</li>
      </ul>
    </section>
  );
}
