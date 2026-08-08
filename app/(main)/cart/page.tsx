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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const count = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-8">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="bg-[#111318] rounded-3xl border border-slate-800 p-16 text-center flex flex-col items-center">
            <ShoppingBag className="w-20 h-20 text-slate-700 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
            <p className="text-slate-400 mb-8 max-w-md">
              Looks like you haven't added anything to your cart yet. Explore our store to find your next favorite gadget.
            </p>
            <Link 
              href="/store"
              className="bg-white text-black font-semibold px-8 py-3.5 rounded-full hover:bg-slate-200 transition-colors inline-flex items-center gap-2"
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
                  className="bg-[#111318] rounded-2xl border border-slate-800 p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative group transition-colors hover:border-slate-700"
                >
                  <Link href={`/product/${item.productId}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-[#0a0a0a] rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-800 overflow-hidden relative">
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
                      className="text-lg sm:text-xl font-bold text-white hover:text-blue-400 transition-colors line-clamp-2 mb-1"
                    >
                      {item.name}
                    </Link>
                    <div className="text-sm text-slate-400 mb-4">
                      {item.variantName !== "Default" ? item.variantName : "Standard Edition"}
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-700 bg-[#0a0a0a] rounded-lg overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeItem(item.variantId)}
                        className="text-slate-500 hover:text-red-400 text-sm font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xl font-bold text-white sm:ml-auto mt-4 sm:mt-0 flex-shrink-0">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-[#111318] rounded-3xl border border-slate-800 p-6 sm:p-8 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal ({count} {count === 1 ? 'item' : 'items'})</span>
                    <span className="text-white">৳{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping Estimate</span>
                    <span className="text-white">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax Estimate</span>
                    <span className="text-white">Calculated at checkout</span>
                  </div>
                </div>

                <div className="h-px bg-slate-800 w-full mb-6" />

                <div className="flex justify-between text-lg font-bold text-white mb-8">
                  <span>Estimated Total</span>
                  <span className="text-blue-400">৳{total.toLocaleString()}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-lg font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] mb-4"
                >
                  Proceed to Checkout
                </Link>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
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
