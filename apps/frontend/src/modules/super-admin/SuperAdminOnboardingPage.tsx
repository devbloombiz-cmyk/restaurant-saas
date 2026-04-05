import { type FormEvent, useState } from "react";
import { registerShopAdmin } from "@/services/authService";
import { useToastStore } from "@/store/toastStore";

export function SuperAdminOnboardingPage() {
  const pushToast = useToastStore((state) => state.pushToast);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
    shopId: string;
    shopName: string;
    currency: "INR" | "GBP" | "USD" | "EUR";
    adminUserId: string;
    adminEmail: string;
  }>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setLoading(true);

    try {
      const data = await registerShopAdmin({
        tenantName: String(form.get("tenantName") ?? ""),
        tenantSlug: String(form.get("tenantSlug") ?? "").toLowerCase(),
        shopName: String(form.get("shopName") ?? ""),
        shopLocation: String(form.get("shopLocation") ?? ""),
        currency: String(form.get("currency") ?? "INR") as "INR" | "GBP" | "USD" | "EUR",
        adminName: String(form.get("adminName") ?? ""),
        adminEmail: String(form.get("adminEmail") ?? "").toLowerCase(),
        adminPassword: String(form.get("adminPassword") ?? "")
      });

      setResult(data);
      pushToast({ type: "success", message: "Shop admin created successfully." });
      (event.target as HTMLFormElement).reset();
    } catch {
      pushToast({ type: "error", message: "Unable to create shop admin. Validate data and try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <header className="app-card p-4">
        <h1 className="text-lg font-semibold">Super Admin Tenant Onboarding</h1>
        <p className="mt-1 text-sm text-slate-500">Create tenant + shop + first shop admin in one flow.</p>
      </header>

      <article className="app-card p-4">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void onSubmit(event)}>
          <input name="tenantName" className="px-3 py-2 text-sm" placeholder="Tenant name" required />
          <input name="tenantSlug" className="px-3 py-2 text-sm" placeholder="tenant-slug" required />
          <input name="shopName" className="px-3 py-2 text-sm" placeholder="Shop name" required />
          <input name="shopLocation" className="px-3 py-2 text-sm" placeholder="Shop location" required />
          <select name="currency" className="px-3 py-2 text-sm" defaultValue="INR" required>
            <option value="INR">Indian Rupee (INR)</option>
            <option value="GBP">British Pound (GBP)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
          </select>
          <input name="adminName" className="px-3 py-2 text-sm" placeholder="Shop admin name" required />
          <input name="adminEmail" type="email" className="px-3 py-2 text-sm" placeholder="Shop admin email" required />
          <input
            name="adminPassword"
            type="password"
            className="md:col-span-2 px-3 py-2 text-sm"
            placeholder="Shop admin password (min 8)"
            minLength={8}
            required
          />

          <button type="submit" disabled={loading} className="app-btn-primary md:col-span-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60">
            {loading ? "Creating..." : "Create Tenant + Shop Admin"}
          </button>
        </form>
      </article>

      {result ? (
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-emerald-900">Created Successfully</h2>
          <ul className="mt-2 space-y-1 text-sm text-emerald-900">
            <li>Tenant: {result.tenantName}</li>
            <li>Tenant ID: {result.tenantId}</li>
            <li>Shop ID: {result.shopId}</li>
            <li>Currency: {result.currency}</li>
            <li>Shop Admin Email: {result.adminEmail}</li>
            <li>Next step: Login as this shop admin using email + password only.</li>
          </ul>
        </article>
      ) : null}
    </section>
  );
}
