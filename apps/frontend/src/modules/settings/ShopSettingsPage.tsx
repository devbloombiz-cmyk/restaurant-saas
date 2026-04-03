import { type FormEvent, useMemo, useState } from "react";
import {
  useCashiersQuery,
  useCreateCashierMutation,
  useDeleteCashierMutation,
  useUpdateCashierMutation
} from "@/hooks/useCashierQueries";
import { useLogsQuery } from "@/hooks/useLogsQueries";
import { useShopSettingsQuery, useUpdateShopSettingsMutation } from "@/hooks/useSettingsQueries";
import { downloadCsv } from "@/services/exportService";
import { useToastStore } from "@/store/toastStore";

type SettingsTab = "shop" | "cashiers" | "logs" | "export";

export function ShopSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("shop");
  const [cashierName, setCashierName] = useState("");
  const [cashierEmail, setCashierEmail] = useState("");
  const [cashierPassword, setCashierPassword] = useState("");
  const [logSearch, setLogSearch] = useState("");

  const pushToast = useToastStore((state) => state.pushToast);

  const { data: settings } = useShopSettingsQuery();
  const updateSettingsMutation = useUpdateShopSettingsMutation();

  const { data: cashiers } = useCashiersQuery();
  const createCashierMutation = useCreateCashierMutation();
  const updateCashierMutation = useUpdateCashierMutation();
  const deleteCashierMutation = useDeleteCashierMutation();

  const { data: logs } = useLogsQuery();

  const filteredLogs = useMemo(() => {
    const input = logSearch.trim().toLowerCase();
    if (!input) {
      return logs ?? [];
    }

    return (logs ?? []).filter((log) => {
      return (
        log.action.toLowerCase().includes(input) ||
        log.module.toLowerCase().includes(input) ||
        String(log.userId).toLowerCase().includes(input)
      );
    });
  }, [logs, logSearch]);

  async function onUpdateSettings(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      await updateSettingsMutation.mutateAsync({
        shopName: String(form.get("shopName") ?? ""),
        currency: String(form.get("currency") ?? "INR"),
        timezone: String(form.get("timezone") ?? "Asia/Kolkata"),
        taxRate: Number(form.get("taxRate") ?? 0),
        receiptFooter: String(form.get("receiptFooter") ?? ""),
        supportNumber: String(form.get("supportNumber") ?? ""),
        logo: String(form.get("logo") ?? "")
      });
      pushToast({ type: "success", message: "Shop settings saved." });
    } catch {
      pushToast({ type: "error", message: "Failed to save shop settings." });
    }
  }

  async function onCreateCashier(): Promise<void> {
    if (!cashierName.trim() || !cashierEmail.trim() || cashierPassword.length < 8) {
      pushToast({ type: "error", message: "Provide valid cashier name/email/password." });
      return;
    }

    try {
      await createCashierMutation.mutateAsync({
        name: cashierName.trim(),
        email: cashierEmail.trim(),
        password: cashierPassword
      });
      setCashierName("");
      setCashierEmail("");
      setCashierPassword("");
      pushToast({ type: "success", message: "Cashier account created." });
    } catch {
      pushToast({ type: "error", message: "Cashier creation failed." });
    }
  }

  async function runExport(kind: "orders" | "reports" | "menu"): Promise<void> {
    try {
      await downloadCsv(kind);
      pushToast({ type: "success", message: `${kind} CSV downloaded.` });
    } catch {
      pushToast({ type: "error", message: `Unable to download ${kind} CSV.` });
    }
  }

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-lg font-semibold">Shop Admin Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage shop profile, cashier accounts, exports and activity logs.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {([
          { id: "shop", label: "Shop" },
          { id: "cashiers", label: "Cashiers" },
          { id: "logs", label: "Activity Logs" },
          { id: "export", label: "Export & Backup" }
        ] as Array<{ id: SettingsTab; label: string }>).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-3 py-2 text-sm ${
              activeTab === tab.id ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "shop" ? (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {!settings ? <p className="text-sm text-slate-500">Loading settings...</p> : null}
          {settings ? (
            <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void onUpdateSettings(event)}>
              <input name="shopName" defaultValue={settings.shopName} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="currency" defaultValue={settings.currency} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="timezone" defaultValue={settings.timezone} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input
                name="taxRate"
                type="number"
                step="0.01"
                defaultValue={settings.taxRate}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="supportNumber"
                defaultValue={settings.supportNumber}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="Support number"
              />
              <input name="logo" defaultValue={settings.logo} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Logo URL" />
              <textarea
                name="receiptFooter"
                defaultValue={settings.receiptFooter}
                className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm"
                rows={3}
              />
              <button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="md:col-span-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save Shop Settings"}
              </button>
            </form>
          ) : null}
        </article>
      ) : null}

      {activeTab === "cashiers" ? (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold">Cashier Management</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-4">
            <input
              value={cashierName}
              onChange={(event) => setCashierName(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Name"
            />
            <input
              value={cashierEmail}
              onChange={(event) => setCashierEmail(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Email"
            />
            <input
              value={cashierPassword}
              onChange={(event) => setCashierPassword(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Password (min 8)"
            />
            <button
              type="button"
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
              onClick={() => {
                void onCreateCashier();
              }}
              disabled={createCashierMutation.isPending}
            >
              Add Cashier
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {(cashiers ?? []).map((cashier) => (
              <div key={cashier._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{cashier.name}</p>
                  <p className="text-xs text-slate-500">{cashier.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    onClick={() => updateCashierMutation.mutate({ id: cashier._id, payload: { isActive: !cashier.isActive } })}
                  >
                    {cashier.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700"
                    onClick={() => deleteCashierMutation.mutate(cashier._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {activeTab === "logs" ? (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Activity Logs</h2>
            <input
              value={logSearch}
              onChange={(event) => setLogSearch(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Filter by action/module/user"
            />
          </div>
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div key={log._id} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-900">
                  {log.action} · {log.module}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  User: {log.userId} | {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
            {filteredLogs.length === 0 ? <p className="text-sm text-slate-500">No logs found.</p> : null}
          </div>
        </article>
      ) : null}

      {activeTab === "export" ? (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold">Export and Backup</h2>
          <p className="mt-1 text-sm text-slate-500">Download CSV snapshots for operational backup and external reporting.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={() => void runExport("orders")}>
              Export Orders CSV
            </button>
            <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={() => void runExport("reports")}>
              Export Reports CSV
            </button>
            <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm" onClick={() => void runExport("menu")}>
              Export Menu CSV
            </button>
          </div>
        </article>
      ) : null}
    </section>
  );
}
