"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

export default function StoreSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialSearch = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Keep local state in sync if URL changes externally
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  // Debounced search function
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    // Only update URL if the internal state differs from URL state
    if (searchTerm === (searchParams.get("search") || "")) return;

    const timeoutId = setTimeout(() => {
      if (pathname !== "/store") {
        if (searchTerm) {
          router.push(`/store?${createQueryString("search", searchTerm)}`);
        }
      } else {
        router.replace(`${pathname}?${createQueryString("search", searchTerm)}`, {
          scroll: false,
        });
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, pathname, router, createQueryString, searchParams]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search products or categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-[#111318] border border-slate-800 text-white placeholder:text-slate-600 rounded-lg py-2.5 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
        <Search size={16} />
      </div>
    </div>
  );
}
