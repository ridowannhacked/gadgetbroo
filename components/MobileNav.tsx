"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X, Search, Store, Smartphone, Watch, Headphones, Zap, Battery, Home } from "lucide-react";
import StoreSearch from "./storefront/StoreSearch";

interface MobileNavProps {
  bannerUrl?: string | null;
  faviconUrl?: string | null;
}

export default function MobileNav({ bannerUrl, faviconUrl }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Close sidebar on navigation (e.g., after a search)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname, searchParams]);

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Mobile Logo Button */}
        <button 
          onClick={() => setIsOpen(true)}
          className="md:hidden flex items-center gap-2"
        >
          {bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bannerUrl} alt="GadgetBroo" className="h-6 w-auto object-contain" />
          ) : (
            <h1 className="text-lg font-bold tracking-wider text-white">
              G<span className="hidden sm:inline">ADGET</span>
              <span className="text-blue-500">B<span className="hidden sm:inline">ROO</span></span>
            </h1>
          )}
        </button>
        
        {/* Desktop Logo Link */}
        <Link href="/" className="hidden md:flex items-center gap-2">
          {bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bannerUrl} alt="GadgetBroo" className="h-6 w-auto object-contain" />
          ) : (
            <h1 className="text-lg font-bold tracking-wider text-white">
              G<span className="hidden sm:inline">ADGET</span>
              <span className="text-blue-500">B<span className="hidden sm:inline">ROO</span></span>
            </h1>
          )}
        </Link>
      </div>

      {/* Mobile Drawer */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative w-4/5 max-w-sm bg-[#0a0a0a] border-r border-slate-800 shadow-2xl h-full flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              {faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={faviconUrl} alt="GB" className="h-8 w-auto object-contain" />
              ) : (
                <h2 className="text-lg font-bold text-white tracking-wider">
                  G<span className="text-blue-500">B</span>
                </h2>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-md bg-slate-900"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              {/* Search */}
              <div className="mb-6">
                <StoreSearch />
              </div>

              {/* Links */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Navigation</p>
                <Link 
                  href="/" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Home size={18} className="text-emerald-400" />
                  Home
                </Link>
                <Link 
                  href="/store" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Store size={18} className="text-blue-400" />
                  All Store
                </Link>
                <Link 
                  href="/store?category=chargers-and-adapters" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Zap size={18} className="text-amber-400" />
                  Chargers & Adapters
                </Link>
                <Link 
                  href="/store?category=mobile-cooler" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Smartphone size={18} className="text-emerald-400" />
                  Mobile Coolers
                </Link>
                <Link 
                  href="/store?category=smart-watch" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Watch size={18} className="text-purple-400" />
                  Smart Watches
                </Link>
                <Link 
                  href="/store?category=sounds-audio" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Headphones size={18} className="text-rose-400" />
                  Sounds & Audio
                </Link>
                <Link 
                  href="/store?category=power-bank" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Battery size={18} className="text-sky-400" />
                  Power Banks
                </Link>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
