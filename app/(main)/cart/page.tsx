"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

    if (!mounted) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
  
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const count = items.reduce((acc, item) => acc + item.quantity, 0);
  
    return (
      <div className="bg-background min-h-screen text-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight mb-8">
            Shopping Cart
          </h1>
  
          {items.length === 0 ? (
            <div className="bg-card rounded-3xl border border-border p-16 text-center flex flex-col items-center">
              <ShoppingBag className="w-20 h-20 text-muted-foreground mb-6" />
              <h2 className="text-2xl font-bold text-foreground mb-3">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Looks like you haven&apos;t added anything to your cart yet. Explore our store to find your next favorite gadget.
              </p>
              <Link
                href="/store"
                className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-full hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                Continue Shopping <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-6">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="bg-card rounded-2xl border border-border p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative group transition-colors hover:border-primary/50"
                >
                  <Link href={`/product/${item.productId}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-muted/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-border overflow-hidden relative">
                    <Image
                      src={`${item.image}${item.image.includes('?') ? '&' : '?'}tr=w-300`}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-contain p-2 sm:p-4 group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.productId}`}
                      className="text-lg sm:text-xl font-bold text-foreground hover:text-primary transition-colors line-clamp-2 mb-1"
                    >
                      {item.name}
                    </Link>
                    <div className="text-sm text-muted-foreground mb-4">
                      {item.variantName !== "Default" ? item.variantName : "Standard Edition"}
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-border bg-background rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-semibold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-muted-foreground hover:text-destructive text-sm font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xl font-bold text-foreground sm:ml-auto mt-4 sm:mt-0 flex-shrink-0">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 sticky top-24">
                <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({count} {count === 1 ? 'item' : 'items'})</span>
                    <span className="text-foreground">৳{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping Estimate</span>
                    <span className="text-foreground">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax Estimate</span>
                    <span className="text-foreground">Calculated at checkout</span>
                  </div>
                </div>

                <div className="h-px bg-border w-full mb-6" />

                <div className="flex justify-between text-lg font-bold text-foreground mb-8">
                  <span>Estimated Total</span>
                  <span className="text-primary">৳{total.toLocaleString()}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl mb-4"
                >
                  Proceed to Checkout
                </Link>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Secure checkout process. We do not store your credit card details.</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
