import { usePlatformSummaryQuery, useSaasShopsQuery, useTenantsQuery, useUpdateShopStatusMutation, useUpdateTenantStatusMutation } from "@/hooks/useSaasQueries";
import { formatCurrency } from "@/utils/currency";

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}

export function SaasDashboardPage() {
  const { data: summary } = usePlatformSummaryQuery();
  const { data: tenants } = useTenantsQuery();
  const { data: shops } = useSaasShopsQuery();
  const updateTenantStatusMutation = useUpdateTenantStatusMutation();
  const updateShopStatusMutation = useUpdateShopStatusMutation();

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold">Platform Control Center</h1>
        <p className="mt-1 text-sm text-slate-500">SaaS-level visibility and activation control for tenants and shops.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Tenants" value={String(summary?.totalTenants ?? 0)} />
        <SummaryCard label="Shops" value={String(summary?.totalShops ?? 0)} />
        <SummaryCard label="Orders" value={String(summary?.totalOrders ?? 0)} />
        <SummaryCard label="Active Cashiers" value={String(summary?.activeCashiers ?? 0)} />
        <SummaryCard label="Revenue Snapshot" value={formatCurrency(summary?.revenueSnapshot ?? 0)} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold">Tenant Status</h2>
          <div className="mt-3 space-y-2">
            {(tenants ?? []).map((tenant) => (
              <div key={tenant._id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{tenant.name}</p>
                  <p className="text-xs text-slate-500">{tenant.slug}</p>
                </div>
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                  disabled={updateTenantStatusMutation.isPending}
                  onClick={() => updateTenantStatusMutation.mutate({ id: tenant._id, isActive: !tenant.isActive })}
                >
                  {tenant.isActive ? "Disable" : "Enable"}
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold">Shop Status</h2>
          <div className="mt-3 space-y-2">
            {(shops ?? []).map((shop) => (
              <div key={shop._id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{shop.name}</p>
                  <p className="text-xs text-slate-500">
                    {shop.tenantId} | {shop.shopId}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                  disabled={updateShopStatusMutation.isPending}
                  onClick={() => updateShopStatusMutation.mutate({ id: shop._id, isActive: !shop.isActive })}
                >
                  {shop.isActive ? "Disable" : "Enable"}
                </button>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
