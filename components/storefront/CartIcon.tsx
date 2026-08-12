"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/store/useCart";

export default function CartIcon() {
  const [mounted, setMounted] = useState(false);
  const items = useCart((state) => state.items);
  const count = items.reduce((acc, item) => acc + item.quantity, 0);

  // Avoid hydration mismatch by rendering after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative p-2 text-slate-300">
        <ShoppingBag size={20} />
      </div>
    );
  }



  return (
    <Link 
      href="/cart"
      className="relative p-2 text-slate-300 hover:text-white transition-colors flex items-center justify-center"
    >
      <ShoppingBag size={20} />
      {count > 0 && (
        <span className="absolute top-1 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-[#0a0a0a]">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
