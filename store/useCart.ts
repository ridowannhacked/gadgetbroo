import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  productId: string;
  name: string;
  variantName: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

interface CartState {
  items: CartItem[];
  isHydrated: boolean;
  setHydrated: () => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      setHydrated: () => set({ isHydrated: true }),
      
      addItem: (item) => {
        set((state) => {
          let newItems = [...state.items];
          const existingItem = state.items.find((i) => i.variantId === item.variantId);
          
          if (existingItem) {
            const qtyToAdd = item.quantity || 1;
            const newQuantity = Math.min(existingItem.quantity + qtyToAdd, existingItem.stock);
            newItems = state.items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i
            );
          } else {
            const initialQty = item.quantity || 1;
            const safeInitialQty = Math.min(initialQty, item.stock);
            newItems = [...state.items, { ...item, quantity: safeInitialQty }];
          }

          // Background sync
          fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "add", items: [{ variantId: item.variantId, quantity: item.quantity || 1 }] })
          }).catch(() => {}); // ignore errors

          return { items: newItems };
        });
      },

      removeItem: (variantId) => {
        set((state) => {
          fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "remove", items: [{ variantId }] })
          }).catch(() => {});
          
          return { items: state.items.filter((i) => i.variantId !== variantId) };
        });
      },

      updateQuantity: (variantId, quantity) => {
        set((state) => {
          fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "update", items: [{ variantId, quantity }] })
          }).catch(() => {});

          return {
            items: state.items.map((i) => {
              if (i.variantId === variantId) {
                const newQuantity = Math.max(1, Math.min(quantity, i.stock));
                return { ...i, quantity: newQuantity };
              }
              return i;
            }),
          };
        });
      },

      clearCart: () => {
        set(() => {
          fetch("/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "clear" })
          }).catch(() => {});
          return { items: [] };
        });
      },

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: "gadgetbroo-cart",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);
