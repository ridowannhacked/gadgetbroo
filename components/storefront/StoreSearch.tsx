"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

export default function StoreSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentUrlSearch = searchParams.get("search") || "";
  
  const [searchTerm, setSearchTerm] = useState(currentUrlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(currentUrlSearch);

  // Sync state if URL changes externally (e.g., back button), without cascading render
  if (currentUrlSearch !== prevUrlSearch) {
    setPrevUrlSearch(currentUrlSearch);
    setSearchTerm(currentUrlSearch);
  }

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
        className="w-full bg-background border border-input text-foreground placeholder:text-muted-foreground rounded-lg py-2.5 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all text-sm"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Search size={16} />
      </div>
    </div>
  );
}
