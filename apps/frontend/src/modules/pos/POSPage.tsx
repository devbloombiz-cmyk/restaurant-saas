import { useMemo, useState } from "react";
import { useCategoriesQuery, useItemsQuery } from "@/hooks/useMenuQueries";
import { useModifiersQuery } from "@/hooks/useModifierQueries";
import { useCreateOrderMutation } from "@/hooks/useOrderQueries";
import { usePrintKotMutation } from "@/hooks/usePrinterQueries";
import { usePrinterSettingsQuery } from "@/hooks/usePrinterQueries";
import { usePosStore } from "@/store/posStore";
import type { MenuItem, Modifier } from "@/types/domain";
import { formatCurrency } from "@/utils/currency";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToastStore } from "@/store/toastStore";

export function POSPage() {
  const { data: categories, isLoading: categoriesLoading } = useCategoriesQuery();
  const { data: items, isLoading: itemsLoading } = useItemsQuery();
  const { data: modifiers } = useModifiersQuery();
  const { data: printerSettings } = usePrinterSettingsQuery();
  const createOrderMutation = useCreateOrderMutation();
  const printKotMutation = usePrintKotMutation();

  const activeCategoryId = usePosStore((state) => state.activeCategoryId);
  const setActiveCategoryId = usePosStore((state) => state.setActiveCategoryId);
  const cart = usePosStore((state) => state.cart);
  const cartTotal = usePosStore((state) => state.cartTotal);
  const addItem = usePosStore((state) => state.addItem);
  const incrementLineQty = usePosStore((state) => state.incrementLineQty);
  const decrementLineQty = usePosStore((state) => state.decrementLineQty);
  const removeLine = usePosStore((state) => state.removeLine);
  const clearCart = usePosStore((state) => state.clearCart);
  const paymentMode = usePosStore((state) => state.paymentMode);
  const setPaymentMode = usePosStore((state) => state.setPaymentMode);
  const pushToast = useToastStore((state) => state.pushToast);

  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);
  const [selectedModifierIds, setSelectedModifierIds] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    if (!items) {
      return [];
    }

    return items.filter((item) => (activeCategoryId ? item.categoryId === activeCategoryId : true));
  }, [items, activeCategoryId]);

  const categoriesList = categories ?? [];
  const itemsList = filteredItems ?? [];

  const currentModifierOptions = useMemo(() => {
    if (!pendingItem || !modifiers) {
      return [];
    }

    return modifiers.filter((modifier) => modifier.itemId === pendingItem._id);
  }, [pendingItem, modifiers]);

  function onSelectItem(item: MenuItem): void {
    const itemModifiers = (modifiers ?? []).filter((modifier) => modifier.itemId === item._id);

    if (item.modifierEnabled || itemModifiers.length > 0) {
      setPendingItem(item);
      const defaultModifierIds = itemModifiers.map((modifier) => modifier._id);
      setSelectedModifierIds(defaultModifierIds);
      return;
    }

    addItem(item, []);
  }

  function toggleModifier(modifierId: string): void {
    setSelectedModifierIds((prev) => (prev.includes(modifierId) ? prev.filter((id) => id !== modifierId) : [...prev, modifierId]));
  }

  function confirmModifiers(): void {
    if (!pendingItem) {
      return;
    }

    const selectedModifiers: Modifier[] = currentModifierOptions.filter((modifier) => selectedModifierIds.includes(modifier._id));
    addItem(pendingItem, selectedModifiers);
    setPendingItem(null);
    setSelectedModifierIds([]);
  }

  async function saveOrder(): Promise<void> {
    if (cart.length === 0) {
      pushToast({ type: "info", message: "Add menu items before saving order." });
      return;
    }

    try {
      const created = await createOrderMutation.mutateAsync({
        orderType: "eat_in",
        paymentMode,
        items: cart.map((line) => ({
          itemId: line.itemId,
          name: line.name,
          qty: line.qty,
          unitPrice: line.unitPrice,
          modifiers: line.modifiers.map((modifier) => ({
            modifierId: modifier.modifierId,
            name: modifier.name,
            priceAdjustment: modifier.priceAdjustment
          }))
        }))
      });

      if (created.orderId && printerSettings?.isActive !== false && printerSettings?.autoPrint !== false) {
        const kotPayload = await printKotMutation.mutateAsync({
          orderId: created.orderId,
          copies: typeof printerSettings?.copies === "number" ? printerSettings.copies : undefined
        });
        const printWindow = window.open("", "_blank", "width=420,height=640");
        if (printWindow) {
          printWindow.document.write(kotPayload.html);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
      }

      clearCart();
      if (printerSettings?.isActive === false || printerSettings?.autoPrint === false) {
        pushToast({ type: "success", message: `Order ${created.orderNumber} saved.` });
      } else {
        pushToast({ type: "success", message: `Order ${created.orderNumber} saved and KOT generated.` });
      }
    } catch {
      pushToast({ type: "error", message: "Order save or KOT generation failed. Retry once." });
    }
  }

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="app-card p-4 lg:col-span-8 md:p-5">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Order Taker POS</h1>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">Touch-first workspace</span>
        </header>

        <div className="mb-4 flex flex-wrap gap-2">
          {categoriesLoading
            ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-24" />
            ))
            : categoriesList.map((category) => (
              <button
                key={category._id}
                type="button"
                onClick={() => setActiveCategoryId(category._id)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  activeCategoryId === category._id
                    ? "bg-gradient-to-r from-teal-700 to-teal-800 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-teal-50"
                }`}
              >
                {category.name}
              </button>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {itemsLoading
            ? Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-24" />
            ))
            : itemsList.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => onSelectItem(item)}
                className="rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm hover:-translate-y-[1px] hover:border-teal-200 hover:shadow-md"
              >
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                <p className="mt-1 text-xs text-slate-500">{item.description || "No description"}</p>
                <p className="mt-2 text-sm font-semibold text-teal-800">{formatCurrency(item.price)}</p>
              </button>
            ))}
        </div>
      </div>

      <aside className="app-card p-4 lg:col-span-4 md:p-5">
        <h2 className="text-base font-semibold">Live Cart</h2>
        <div className="mt-3 space-y-2">
          {cart.length === 0 ? <p className="text-sm text-slate-500">No items in cart</p> : null}
          {cart.map((line) => (
            <div key={line.lineId} className="rounded-xl border border-slate-200 p-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{line.name}</p>
                  <p className="text-xs text-slate-500">{line.modifiers.map((modifier) => modifier.name).join(", ") || "No modifiers"}</p>
                </div>
                <button type="button" className="text-xs font-semibold text-rose-700" onClick={() => removeLine(line.lineId)}>
                  Remove
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-2 py-1">
                  <button type="button" className="text-sm font-semibold text-slate-700" onClick={() => decrementLineQty(line.lineId)}>
                    -
                  </button>
                  <span className="min-w-6 text-center text-sm font-medium">{line.qty}</span>
                  <button type="button" className="text-sm font-semibold text-slate-700" onClick={() => incrementLineQty(line.lineId)}>
                    +
                  </button>
                </div>
                <p className="text-xs text-slate-700">
                  {line.qty} x {formatCurrency(line.unitPrice + line.modifiers.reduce((sum, modifier) => sum + modifier.priceAdjustment, 0))} ={" "}
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(line.qty * (line.unitPrice + line.modifiers.reduce((sum, modifier) => sum + modifier.priceAdjustment, 0)))}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="app-subtle mt-4 p-3">
          <p className="text-sm text-slate-600">Payment Mode</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["cash", "card", "pending"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPaymentMode(mode)}
                className={`rounded-lg px-2 py-2 text-xs font-semibold uppercase ${
                  paymentMode === mode ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-slate-700">Total</span>
            <span className="text-lg font-semibold">{formatCurrency(cartTotal)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            void saveOrder();
          }}
          disabled={createOrderMutation.isPending || cart.length === 0}
          className="app-btn-primary mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {createOrderMutation.isPending ? "Saving..." : "Save & Print"}
        </button>
      </aside>

      {pendingItem ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="app-card w-full max-w-md p-4">
                <h3 className="text-base font-semibold">Select Extras for {pendingItem.name}</h3>
                <p className="mt-1 text-xs text-slate-500">Recommended extras are pre-selected. Uncheck only if not needed.</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="app-btn-ghost rounded-lg px-2 py-1 text-xs text-slate-700"
                    onClick={() => setSelectedModifierIds(currentModifierOptions.map((modifier) => modifier._id))}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="app-btn-ghost rounded-lg px-2 py-1 text-xs text-slate-700"
                    onClick={() => setSelectedModifierIds([])}
                  >
                    Clear All
                  </button>
                </div>
            <div className="mt-3 space-y-2">
              {currentModifierOptions.length === 0 ? <p className="text-sm text-slate-500">No modifiers available</p> : null}
              {currentModifierOptions.map((modifier) => (
                <label key={modifier._id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <span>
                        {modifier.type === "add" ? "+ " : "No "}
                        {modifier.name}
                  </span>
                  <input type="checkbox" checked={selectedModifierIds.includes(modifier._id)} onChange={() => toggleModifier(modifier._id)} />
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="app-btn-ghost rounded-xl px-3 py-2 text-sm"
                onClick={() => {
                  setPendingItem(null);
                  setSelectedModifierIds([]);
                }}
              >
                Cancel
              </button>
              <button type="button" className="app-btn-primary rounded-xl px-3 py-2 text-sm" onClick={confirmModifiers}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
