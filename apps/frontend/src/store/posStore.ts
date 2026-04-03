import { create } from "zustand";
import type { MenuItem, Modifier, OrderPaymentMode } from "@/types/domain";

type CartLine = {
  lineId: string;
  itemId: string;
  name: string;
  qty: number;
  unitPrice: number;
  modifiers: Array<{ modifierId: string; name: string; priceAdjustment: number }>;
};

type PosStoreState = {
  activeCategoryId: string | null;
  cart: CartLine[];
  cartTotal: number;
  paymentMode: OrderPaymentMode;
  setActiveCategoryId: (categoryId: string | null) => void;
  setPaymentMode: (mode: OrderPaymentMode) => void;
  addItem: (item: MenuItem, modifiers: Modifier[]) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
};

function createLineId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const usePosStore = create<PosStoreState>((set) => ({
  activeCategoryId: null,
  cart: [],
  cartTotal: 0,
  paymentMode: "cash",
  setActiveCategoryId: (activeCategoryId) => set({ activeCategoryId }),
  setPaymentMode: (paymentMode) => set({ paymentMode }),
  addItem: (item, modifiers) =>
    set((state) => {
      const newLine = {
        lineId: createLineId(),
        itemId: item._id,
        name: item.name,
        qty: 1,
        unitPrice: item.price,
        modifiers: modifiers.map((modifier) => ({
          modifierId: modifier._id,
          name: modifier.name,
          priceAdjustment: modifier.priceAdjustment
        }))
      };

      const lineModifierTotal = newLine.modifiers.reduce((sum, modifier) => sum + modifier.priceAdjustment, 0);

      return {
        cart: [...state.cart, newLine],
        cartTotal: state.cartTotal + newLine.qty * (newLine.unitPrice + lineModifierTotal)
      };
    }),
  removeLine: (lineId) =>
    set((state) => {
      const toRemove = state.cart.find((line) => line.lineId === lineId);

      if (!toRemove) {
        return state;
      }

      const modifierTotal = toRemove.modifiers.reduce((sum, modifier) => sum + modifier.priceAdjustment, 0);
      const reducedTotal = state.cartTotal - toRemove.qty * (toRemove.unitPrice + modifierTotal);

      return {
        cart: state.cart.filter((line) => line.lineId !== lineId),
        cartTotal: Math.max(0, reducedTotal)
      };
    }),
  clearCart: () => set({ cart: [], cartTotal: 0 })
}));
