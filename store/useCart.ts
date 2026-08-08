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
      
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.variantId === item.variantId);
          if (existingItem) {
            // Check stock limit
            const qtyToAdd = item.quantity || 1;
            const newQuantity = Math.min(existingItem.quantity + qtyToAdd, existingItem.stock);
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId ? { ...i, quantity: newQuantity } : i
              ),
            };
          }
          const initialQty = item.quantity || 1;
          const safeInitialQty = Math.min(initialQty, item.stock);
          return { items: [...state.items, { ...item, quantity: safeInitialQty }] };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        set((state) => ({
          items: state.items.map((i) => {
            if (i.variantId === variantId) {
              const newQuantity = Math.max(1, Math.min(quantity, i.stock));
              return { ...i, quantity: newQuantity };
            }
            return i;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: "gadgetbroo-cart",
    }
  )
);
