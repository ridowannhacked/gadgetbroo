"use client";

import { useEffect, useRef } from "react";
import { useAuthSession } from "@/components/auth/AuthSessionProvider";
import { useCart, CartItem } from "@/store/useCart";

export function CartSync() {
  const { user } = useAuthSession();
  const items = useCart((state) => state.items);
  const isHydrated = useCart((state) => state.isHydrated);
  
  // Track if we've done the initial sync on login
  const hasSynced = useRef(false);

  useEffect(() => {
    // We must wait for hydration to complete so we have the localStorage cart
    if (!user || !isHydrated) {
      if (!user) hasSynced.current = false;
      return;
    }

    if (!hasSynced.current) {
      // First login sync: push local items to DB, then fetch the merged DB cart
      hasSynced.current = true;
      syncCartWithServer("sync", items);
    }
  }, [user, isHydrated, items]);

  return null;
}

// Function to call the API and update local store
export async function syncCartWithServer(action: "sync" | "add" | "update" | "remove" | "clear", payloadItems: any[] = []) {
  try {
    const res = await fetch("/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, items: payloadItems }),
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.cart) {
        // Transform DB cart format to Zustand CartItem format
        const formattedItems: CartItem[] = data.cart.items.map((dbItem: any) => ({
          variantId: dbItem.variantId,
          productId: dbItem.variant.productId,
          name: dbItem.variant.product.name,
          variantName: dbItem.variant.name,
          price: Number(dbItem.variant.price),
          image: dbItem.variant.product.images?.[0]?.mediaFile?.url || "",
          quantity: dbItem.quantity,
          stock: dbItem.variant.stock,
        }));
        
        // Update Zustand store bypassing normal actions to avoid infinite loops
        useCart.setState({ items: formattedItems });
      }
    }
  } catch (err) {
    console.error("Cart sync error:", err);
  }
}
