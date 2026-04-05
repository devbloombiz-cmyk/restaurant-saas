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
  incrementLineQty: (lineId: string) => void;
  decrementLineQty: (lineId: string) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
};

function createLineId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function calculateLineTotal(line: {
  qty: number;
  unitPrice: number;
  modifiers: Array<{ priceAdjustment: number }>;
}): number {
  const modifierTotal = line.modifiers.reduce((sum, modifier) => sum + modifier.priceAdjustment, 0);
  return line.qty * (line.unitPrice + modifierTotal);
}

function calculateCartTotal(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + calculateLineTotal(line), 0);
}

function toModifierSignature(modifiers: Array<{ modifierId: string }>): string {
  return modifiers
    .map((modifier) => modifier.modifierId)
    .sort()
    .join("|");
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
      const normalizedModifiers = modifiers.map((modifier) => ({
        modifierId: modifier._id,
        name: modifier.name,
        priceAdjustment: modifier.priceAdjustment
      }));

      const existingIndex = state.cart.findIndex(
        (line) => line.itemId === item._id && toModifierSignature(line.modifiers) === toModifierSignature(normalizedModifiers)
      );

      if (existingIndex >= 0) {
        const nextCart = state.cart.map((line, index) =>
          index === existingIndex
            ? {
                ...line,
                qty: line.qty + 1
              }
            : line
        );

        return {
          cart: nextCart,
          cartTotal: calculateCartTotal(nextCart)
        };
      }

      const newLine: CartLine = {
        lineId: createLineId(),
        itemId: item._id,
        name: item.name,
        qty: 1,
        unitPrice: item.price,
        modifiers: normalizedModifiers
      };

      const nextCart = [...state.cart, newLine];

      return {
        cart: nextCart,
        cartTotal: calculateCartTotal(nextCart)
      };
    }),
  incrementLineQty: (lineId) =>
    set((state) => {
      const nextCart = state.cart.map((line) =>
        line.lineId === lineId
          ? {
              ...line,
              qty: line.qty + 1
            }
          : line
      );

      return {
        cart: nextCart,
        cartTotal: calculateCartTotal(nextCart)
      };
    }),
  decrementLineQty: (lineId) =>
    set((state) => {
      const nextCart = state.cart
        .map((line) =>
          line.lineId === lineId
            ? {
                ...line,
                qty: line.qty - 1
              }
            : line
        )
        .filter((line) => line.qty > 0);

      return {
        cart: nextCart,
        cartTotal: calculateCartTotal(nextCart)
      };
    }),
  removeLine: (lineId) =>
    set((state) => {
      const nextCart = state.cart.filter((line) => line.lineId !== lineId);

      return {
        cart: nextCart,
        cartTotal: calculateCartTotal(nextCart)
      };
    }),
  clearCart: () => set({ cart: [], cartTotal: 0 })
}));
