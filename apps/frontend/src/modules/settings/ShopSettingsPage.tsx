import { type FormEvent, useMemo, useState } from "react";
import {
  useCashiersQuery,
  useCreateCashierMutation,
  useDeleteCashierMutation,
  useUpdateCashierMutation
} from "@/hooks/useCashierQueries";
import { useInventoryQuery, useUpdateInventoryMutation } from "@/hooks/useMenuQueries";
import { usePrinterSettingsQuery, useUpdatePrinterSettingsMutation } from "@/hooks/usePrinterQueries";
import { useShopSettingsQuery, useUpdateShopSettingsMutation } from "@/hooks/useSettingsQueries";
import { downloadCsv } from "@/services/exportService";
import { useToastStore } from "@/store/toastStore";
import type { InventoryItem } from "@/types/domain";

type SettingsTab = "shop" | "cashiers" | "inventory" | "printer" | "export";

type InventoryDraft = {
  stockQty: string;
  lowStockThreshold: string;
  isAvailable: boolean;
};

const SUPPORTED_CURRENCIES = [
  { code: "INR", label: "Indian Rupee (INR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" }
] as const;

export function ShopSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("shop");
  const [cashierName, setCashierName] = useState("");
  const [cashierEmail, setCashierEmail] = useState("");
  const [cashierPassword, setCashierPassword] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryDrafts, setInventoryDrafts] = useState<Record<string, InventoryDraft>>({});

  const pushToast = useToastStore((state) => state.pushToast);

  const { data: settings } = useShopSettingsQuery();
  const updateSettingsMutation = useUpdateShopSettingsMutation();

  const { data: cashiers } = useCashiersQuery();
  const createCashierMutation = useCreateCashierMutation();
  const updateCashierMutation = useUpdateCashierMutation();
  const deleteCashierMutation = useDeleteCashierMutation();

  const { data: inventoryItems } = useInventoryQuery();
  const updateInventoryMutation = useUpdateInventoryMutation();
  const { data: printerSettings } = usePrinterSettingsQuery();
  const updatePrinterSettingsMutation = useUpdatePrinterSettingsMutation();

  const filteredInventory = useMemo(() => {
    const input = inventorySearch.trim().toLowerCase();
    if (!input) {
      return inventoryItems ?? [];
    }

    return (inventoryItems ?? []).filter((item) => item.name.toLowerCase().includes(input));
  }, [inventoryItems, inventorySearch]);

  function getInventoryDraft(item: InventoryItem): InventoryDraft {
    const draft = inventoryDrafts[item._id];
    if (draft) {
      return draft;
    }

    return {
      stockQty: String(item.stockQty),
      lowStockThreshold: String(item.lowStockThreshold),
      isAvailable: item.isAvailable
    };
  }

  function updateInventoryDraft(item: InventoryItem, patch: Partial<InventoryDraft>): void {
    setInventoryDrafts((current) => {
      const base = current[item._id] ?? {
        stockQty: String(item.stockQty),
        lowStockThreshold: String(item.lowStockThreshold),
        isAvailable: item.isAvailable
      };

      return {
        ...current,
        [item._id]: {
          ...base,
          ...patch
        }
      };
    });
  }

  async function saveInventory(item: InventoryItem): Promise<void> {
    const draft = getInventoryDraft(item);
    const stockQty = Number(draft.stockQty);
    const lowStockThreshold = Number(draft.lowStockThreshold);

    if (!Number.isFinite(stockQty) || stockQty < 0 || !Number.isFinite(lowStockThreshold) || lowStockThreshold < 0) {
      pushToast({ type: "error", message: "Inventory values must be zero or greater." });
      return;
    }

    try {
      await updateInventoryMutation.mutateAsync({
        id: item._id,
        payload: {
          stockQty,
          lowStockThreshold,
          isAvailable: draft.isAvailable
        }
      });
      pushToast({ type: "success", message: "Inventory updated." });
      setInventoryDrafts((current) => {
        const next = { ...current };
        delete next[item._id];
        return next;
      });
    } catch {
      pushToast({ type: "error", message: "Failed to update inventory." });
    }
  }

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
      pushToast({ type: "error", message: "Provide valid order taker name/email/password." });
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
      pushToast({ type: "success", message: "Order taker account created." });
    } catch {
      pushToast({ type: "error", message: "Order taker creation failed." });
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

  async function onUpdatePrinterSettings(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!printerSettings) {
      return;
    }

    const form = new FormData(event.currentTarget);
    try {
      await updatePrinterSettingsMutation.mutateAsync({
        printerName: String(form.get("printerName") ?? printerSettings.printerName),
        printerType: String(form.get("printerType") ?? printerSettings.printerType) as "thermal" | "inkjet" | "laser",
        connectionType: String(form.get("connectionType") ?? printerSettings.connectionType) as "lan" | "wifi" | "usb",
        ipAddress: String(form.get("ipAddress") ?? printerSettings.ipAddress),
        port: Number(form.get("port") ?? printerSettings.port),
        paperWidth: Number(form.get("paperWidth") ?? printerSettings.paperWidth) as 58 | 80,
        copies: Number(form.get("copies") ?? printerSettings.copies),
        cutMode: String(form.get("cutMode") ?? printerSettings.cutMode) as "none" | "partial" | "full",
        feedBeforeCutLines: Number(form.get("feedBeforeCutLines") ?? printerSettings.feedBeforeCutLines),
        autoPrint: form.get("autoPrint") === "on",
        isActive: form.get("isActive") === "on"
      });
      pushToast({ type: "success", message: "Printer settings saved." });
    } catch {
      pushToast({ type: "error", message: "Failed to save printer settings." });
    }
  }

  return (
    <section className="space-y-4">
      <header className="app-card p-4">
        <h1 className="text-lg font-semibold">Shop Admin Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage shop profile, order taker accounts, inventory and exports.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {([
          { id: "shop", label: "Shop" },
          { id: "cashiers", label: "Order Takers" },
          { id: "inventory", label: "Inventory" },
          { id: "printer", label: "Printer" },
          { id: "export", label: "Export & Backup" }
        ] as Array<{ id: SettingsTab; label: string }>).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-teal-700 to-teal-800 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-teal-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "shop" ? (
        <article className="app-card p-4">
          {!settings ? <p className="text-sm text-slate-500">Loading settings...</p> : null}
          {settings ? (
            <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void onUpdateSettings(event)}>
              <input name="shopName" defaultValue={settings.shopName} className="px-3 py-2 text-sm" />
              <select
                name="currency"
                defaultValue={settings.currency || "INR"}
                className="px-3 py-2 text-sm"
                disabled={Boolean(settings.currencyLocked)}
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.label}
                  </option>
                ))}
              </select>
              {settings.currencyLocked ? (
                <p className="-mt-1 text-xs text-amber-700 md:col-span-2">Currency is locked by super admin during onboarding.</p>
              ) : null}
              <input name="timezone" defaultValue={settings.timezone} className="px-3 py-2 text-sm" />
              <input
                name="taxRate"
                type="number"
                step="0.01"
                defaultValue={settings.taxRate}
                className="px-3 py-2 text-sm"
              />
              <input
                name="supportNumber"
                defaultValue={settings.supportNumber}
                className="px-3 py-2 text-sm"
                placeholder="Support number"
              />
              <input name="logo" defaultValue={settings.logo} className="px-3 py-2 text-sm" placeholder="Logo URL" />
              <textarea
                name="receiptFooter"
                defaultValue={settings.receiptFooter}
                className="md:col-span-2 px-3 py-2 text-sm"
                rows={3}
              />
              <button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="app-btn-primary md:col-span-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {updateSettingsMutation.isPending ? "Saving..." : "Save Shop Settings"}
              </button>
            </form>
          ) : null}
        </article>
      ) : null}

      {activeTab === "cashiers" ? (
        <article className="app-card p-4">
          <h2 className="text-base font-semibold">Order Taker / Counter Staff Management</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-4">
            <input
              value={cashierName}
              onChange={(event) => setCashierName(event.target.value)}
              className="px-3 py-2 text-sm"
              placeholder="Name"
            />
            <input
              value={cashierEmail}
              onChange={(event) => setCashierEmail(event.target.value)}
              className="px-3 py-2 text-sm"
              placeholder="Email"
            />
            <input
              value={cashierPassword}
              onChange={(event) => setCashierPassword(event.target.value)}
              className="px-3 py-2 text-sm"
              placeholder="Password (min 8)"
            />
            <button
              type="button"
              className="app-btn-primary rounded-xl px-3 py-2 text-sm"
              onClick={() => {
                void onCreateCashier();
              }}
              disabled={createCashierMutation.isPending}
            >
              Add Order Taker
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {(cashiers ?? []).map((cashier) => (
              <div key={cashier._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{cashier.name}</p>
                  <p className="text-xs text-slate-500">{cashier.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="app-btn-ghost rounded-lg px-2 py-1 text-xs"
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

      {activeTab === "inventory" ? (
        <article className="app-card p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Inventory Management</h2>
            <input
              value={inventorySearch}
              onChange={(event) => setInventorySearch(event.target.value)}
              className="px-3 py-2 text-sm"
              placeholder="Search item by name"
            />
          </div>
          <div className="space-y-2">
            {filteredInventory.map((item) => {
              const draft = getInventoryDraft(item);
              const isLow = Number(draft.stockQty) <= Number(draft.lowStockThreshold);

              return (
                <div key={item._id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    {isLow ? <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-900">Low Stock</span> : null}
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-4">
                    <label className="text-xs text-slate-500">
                      Stock Qty
                      <input
                        type="number"
                        min={0}
                        value={draft.stockQty}
                        onChange={(event) => updateInventoryDraft(item, { stockQty: event.target.value })}
                        className="mt-1 w-full px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-xs text-slate-500">
                      Low Stock Alert
                      <input
                        type="number"
                        min={0}
                        value={draft.lowStockThreshold}
                        onChange={(event) => updateInventoryDraft(item, { lowStockThreshold: event.target.value })}
                        className="mt-1 w-full px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="flex items-center gap-2 self-end text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={draft.isAvailable}
                        onChange={(event) => updateInventoryDraft(item, { isAvailable: event.target.checked })}
                      />
                      Available for sale
                    </label>
                    <button
                      type="button"
                      className="app-btn-primary self-end rounded-xl px-3 py-2 text-sm disabled:opacity-50"
                      onClick={() => {
                        void saveInventory(item);
                      }}
                      disabled={updateInventoryMutation.isPending}
                    >
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredInventory.length === 0 ? <p className="text-sm text-slate-500">No inventory items found.</p> : null}
          </div>
        </article>
      ) : null}

      {activeTab === "printer" ? (
        <article className="app-card p-4">
          <h2 className="text-base font-semibold">Thermal Printer Setup</h2>
          <p className="mt-1 text-sm text-slate-500">Configure paper size, copies, cut behavior, and device connectivity.</p>

          {!printerSettings ? <p className="mt-3 text-sm text-slate-500">Loading printer settings...</p> : null}

          {printerSettings ? (
            <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={(event) => void onUpdatePrinterSettings(event)}>
              <input name="printerName" defaultValue={printerSettings.printerName} className="px-3 py-2 text-sm" placeholder="Printer name" />
              <select name="printerType" defaultValue={printerSettings.printerType} className="px-3 py-2 text-sm">
                <option value="thermal">Thermal</option>
                <option value="inkjet">Inkjet</option>
                <option value="laser">Laser</option>
              </select>
              <select name="connectionType" defaultValue={printerSettings.connectionType} className="px-3 py-2 text-sm">
                <option value="lan">LAN</option>
                <option value="wifi">WiFi</option>
                <option value="usb">USB</option>
              </select>
              <input name="ipAddress" defaultValue={printerSettings.ipAddress} className="px-3 py-2 text-sm" placeholder="IP address" />
              <input name="port" type="number" defaultValue={printerSettings.port} className="px-3 py-2 text-sm" placeholder="Port" />
              <select name="paperWidth" defaultValue={String(printerSettings.paperWidth)} className="px-3 py-2 text-sm">
                <option value="58">58mm</option>
                <option value="80">80mm</option>
              </select>
              <input name="copies" type="number" min={1} defaultValue={printerSettings.copies} className="px-3 py-2 text-sm" placeholder="Copies" />
              <select name="cutMode" defaultValue={printerSettings.cutMode} className="px-3 py-2 text-sm">
                <option value="none">No auto-cut</option>
                <option value="partial">Partial cut</option>
                <option value="full">Full cut</option>
              </select>
              <input
                name="feedBeforeCutLines"
                type="number"
                min={0}
                max={10}
                defaultValue={printerSettings.feedBeforeCutLines}
                className="px-3 py-2 text-sm"
                placeholder="Feed lines before cut"
              />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input name="autoPrint" type="checkbox" defaultChecked={printerSettings.autoPrint} /> Auto print when order is saved
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input name="isActive" type="checkbox" defaultChecked={printerSettings.isActive} /> Printer active
              </label>

              <p className="app-subtle md:col-span-2 px-3 py-2 text-xs text-slate-600">
                For real thermal auto-cut, enable cutter in printer driver/device settings. Browser print cannot send guaranteed hardware cut commands directly.
              </p>

              <button
                type="submit"
                disabled={updatePrinterSettingsMutation.isPending}
                className="app-btn-primary md:col-span-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {updatePrinterSettingsMutation.isPending ? "Saving..." : "Save Printer Settings"}
              </button>
            </form>
          ) : null}
        </article>
      ) : null}

      {activeTab === "export" ? (
        <article className="app-card p-4">
          <h2 className="text-base font-semibold">Export and Backup</h2>
          <p className="mt-1 text-sm text-slate-500">Download CSV snapshots for operational backup and external reporting.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button type="button" className="app-btn-ghost rounded-xl px-3 py-2 text-sm" onClick={() => void runExport("orders")}>
              Export Orders CSV
            </button>
            <button type="button" className="app-btn-ghost rounded-xl px-3 py-2 text-sm" onClick={() => void runExport("reports")}>
              Export Reports CSV
            </button>
            <button type="button" className="app-btn-ghost rounded-xl px-3 py-2 text-sm" onClick={() => void runExport("menu")}>
              Export Menu CSV
            </button>
          </div>
        </article>
      ) : null}
    </section>
  );
}
