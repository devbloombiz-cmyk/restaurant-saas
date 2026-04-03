import { type FormEvent, useMemo, useState } from "react";
import { useOrdersQuery } from "@/hooks/useOrderQueries";
import {
  usePrinterSettingsQuery,
  usePrintKotMutation,
  useReprintLastMutation,
  useUpdatePrinterSettingsMutation
} from "@/hooks/usePrinterQueries";
import { useToastStore } from "@/store/toastStore";

export function OperationsPage() {
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [copies, setCopies] = useState("1");

  const { data: orders } = useOrdersQuery();
  const { data: settings } = usePrinterSettingsQuery();
  const updateSettingsMutation = useUpdatePrinterSettingsMutation();
  const printKotMutation = usePrintKotMutation();
  const reprintLastMutation = useReprintLastMutation();

  const pushToast = useToastStore((state) => state.pushToast);

  const recentOrders = useMemo(() => (orders ?? []).slice(0, 20), [orders]);

  async function onPrintKot(): Promise<void> {
    if (!selectedOrderId) {
      pushToast({ type: "error", message: "Select an order before printing KOT." });
      return;
    }

    try {
      const payload = await printKotMutation.mutateAsync({ orderId: selectedOrderId, copies: Number(copies) || 1 });
      const printWindow = window.open("", "_blank", "width=420,height=640");
      if (printWindow) {
        printWindow.document.write(payload.html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
      pushToast({ type: "success", message: `KOT ${payload.orderNumber} generated.` });
    } catch {
      pushToast({ type: "error", message: "KOT print failed. Retry once network is stable." });
    }
  }

  async function onReprintLast(): Promise<void> {
    try {
      const payload = await reprintLastMutation.mutateAsync();
      const printWindow = window.open("", "_blank", "width=420,height=640");
      if (printWindow) {
        printWindow.document.write(payload.html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
      pushToast({ type: "success", message: `Reprint prepared for ${payload.orderNumber}.` });
    } catch {
      pushToast({ type: "error", message: "No order available for reprint." });
    }
  }

  async function onSavePrinterSettings(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!settings) {
      return;
    }

    const form = new FormData(event.currentTarget);
    try {
      await updateSettingsMutation.mutateAsync({
        printerName: String(form.get("printerName") ?? settings.printerName),
        printerType: String(form.get("printerType") ?? settings.printerType) as "thermal" | "inkjet" | "laser",
        connectionType: String(form.get("connectionType") ?? settings.connectionType) as "lan" | "wifi" | "usb",
        ipAddress: String(form.get("ipAddress") ?? settings.ipAddress),
        port: Number(form.get("port") ?? settings.port),
        paperWidth: Number(form.get("paperWidth") ?? settings.paperWidth) as 58 | 80,
        copies: Number(form.get("copies") ?? settings.copies),
        autoPrint: form.get("autoPrint") === "on",
        isActive: form.get("isActive") === "on"
      });
      pushToast({ type: "success", message: "Printer settings updated." });
    } catch {
      pushToast({ type: "error", message: "Could not update printer settings." });
    }
  }

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-5">
        <h1 className="text-lg font-semibold">KOT Print Center</h1>
        <p className="mt-1 text-sm text-slate-500">Select an order and dispatch thermal KOT payload.</p>

        <label className="mt-4 block text-sm text-slate-700">Recent Orders</label>
        <select
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={selectedOrderId}
          onChange={(event) => setSelectedOrderId(event.target.value)}
        >
          <option value="">Select order</option>
          {recentOrders.map((order) => (
            <option key={String(order._id)} value={String(order._id)}>
              {String(order.orderNumber)} | {String(order.paymentMode)} | {String(order.total)}
            </option>
          ))}
        </select>

        <label className="mt-3 block text-sm text-slate-700">Copies</label>
        <input
          type="number"
          min={1}
          value={copies}
          onChange={(event) => setCopies(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            onClick={() => {
              void onPrintKot();
            }}
            disabled={printKotMutation.isPending}
          >
            {printKotMutation.isPending ? "Preparing..." : "Print KOT"}
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            onClick={() => {
              void onReprintLast();
            }}
            disabled={reprintLastMutation.isPending}
          >
            {reprintLastMutation.isPending ? "Retrying..." : "Reprint Last"}
          </button>
        </div>
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-7">
        <h2 className="text-lg font-semibold">Printer Settings</h2>
        <p className="mt-1 text-sm text-slate-500">Tune paper width, connectivity, and print defaults.</p>

        {!settings ? <p className="mt-4 text-sm text-slate-500">Loading settings...</p> : null}

        {settings ? (
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={(event) => void onSavePrinterSettings(event)}>
            <input
              name="printerName"
              defaultValue={settings.printerName}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Printer name"
            />
            <select name="printerType" defaultValue={settings.printerType} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="thermal">Thermal</option>
              <option value="inkjet">Inkjet</option>
              <option value="laser">Laser</option>
            </select>
            <select
              name="connectionType"
              defaultValue={settings.connectionType}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="lan">LAN</option>
              <option value="wifi">WiFi</option>
              <option value="usb">USB</option>
            </select>
            <input
              name="ipAddress"
              defaultValue={settings.ipAddress}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="IP address"
            />
            <input
              name="port"
              type="number"
              defaultValue={settings.port}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Port"
            />
            <select name="paperWidth" defaultValue={String(settings.paperWidth)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="58">58mm</option>
              <option value="80">80mm</option>
            </select>
            <input
              name="copies"
              type="number"
              min={1}
              defaultValue={settings.copies}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Copies"
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input name="autoPrint" type="checkbox" defaultChecked={settings.autoPrint} /> Auto print on order save
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input name="isActive" type="checkbox" defaultChecked={settings.isActive} /> Printer active
            </label>

            <button
              type="submit"
              className="md:col-span-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Printer Settings"}
            </button>
          </form>
        ) : null}
      </article>
    </section>
  );
}
