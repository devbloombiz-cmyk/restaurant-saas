import { useMemo, useState } from "react";
import { useCategoriesQuery, useItemsQuery } from "@/hooks/useMenuQueries";
import { useModifiersQuery } from "@/hooks/useModifierQueries";
import { useCreateOrderMutation } from "@/hooks/useOrderQueries";
import { usePosStore } from "@/store/posStore";
import type { MenuItem, Modifier } from "@/types/domain";
import { formatCurrency } from "@/utils/currency";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToastStore } from "@/store/toastStore";

export function POSPage() {
  const { data: categories, isLoading: categoriesLoading } = useCategoriesQuery();
  const { data: items, isLoading: itemsLoading } = useItemsQuery();
  const { data: modifiers } = useModifiersQuery();
  const createOrderMutation = useCreateOrderMutation();

  const activeCategoryId = usePosStore((state) => state.activeCategoryId);
  const setActiveCategoryId = usePosStore((state) => state.setActiveCategoryId);
  const cart = usePosStore((state) => state.cart);
  const cartTotal = usePosStore((state) => state.cartTotal);
  const addItem = usePosStore((state) => state.addItem);
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
    if (item.modifierEnabled) {
      setPendingItem(item);
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

      clearCart();
      pushToast({ type: "success", message: `Order ${created.orderNumber} saved.` });
      window.print();
    } catch {
      pushToast({ type: "error", message: "Order save failed. Retry when network is stable." });
    }
  }

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-8">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Cashier POS</h1>
          <span className="text-xs text-slate-500">Touch-first workspace</span>
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
                className={`rounded-lg px-4 py-2 text-sm ${
                  activeCategoryId === category._id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
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
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-left hover:border-slate-400"
              >
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                <p className="mt-1 text-xs text-slate-500">{item.description || "No description"}</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{formatCurrency(item.price)}</p>
              </button>
            ))}
        </div>
      </div>

      <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-4">
        <h2 className="text-base font-semibold">Live Cart</h2>
        <div className="mt-3 space-y-2">
          {cart.length === 0 ? <p className="text-sm text-slate-500">No items in cart</p> : null}
          {cart.map((line) => (
            <div key={line.lineId} className="rounded-lg border border-slate-200 p-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{line.name}</p>
                  <p className="text-xs text-slate-500">{line.modifiers.map((modifier) => modifier.name).join(", ") || "No modifiers"}</p>
                </div>
                <button type="button" className="text-xs text-red-600" onClick={() => removeLine(line.lineId)}>
                  Remove
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                {line.qty} x {formatCurrency(line.unitPrice)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-slate-100 p-3">
          <p className="text-sm text-slate-600">Payment Mode</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["cash", "card", "pending"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPaymentMode(mode)}
                className={`rounded-md px-2 py-2 text-xs font-medium uppercase ${
                  paymentMode === mode ? "bg-slate-900 text-white" : "bg-white text-slate-700"
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
          className="mt-4 w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {createOrderMutation.isPending ? "Saving..." : "Save & Print"}
        </button>
      </aside>

      {pendingItem ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
            <h3 className="text-base font-semibold">Select Modifiers for {pendingItem.name}</h3>
            <div className="mt-3 space-y-2">
              {currentModifierOptions.length === 0 ? <p className="text-sm text-slate-500">No modifiers available</p> : null}
              {currentModifierOptions.map((modifier) => (
                <label key={modifier._id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
                  <span>
                    {modifier.name} ({modifier.type})
                  </span>
                  <input type="checkbox" checked={selectedModifierIds.includes(modifier._id)} onChange={() => toggleModifier(modifier._id)} />
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                onClick={() => {
                  setPendingItem(null);
                  setSelectedModifierIds([]);
                }}
              >
                Cancel
              </button>
              <button type="button" className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" onClick={confirmModifiers}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
