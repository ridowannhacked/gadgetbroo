import { ReactNode } from "react";
import Link from "next/link";
import { User, Package, MapPin, LogOut } from "lucide-react";
import LogoutButton from "../../../components/logoutUser";

export default function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070a12] text-slate-200 font-sans">
      {/* Top Navbar for Dashboard */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800/60 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 relative">
          
          {/* Left: Logo */}
          <div className="flex flex-1 items-center">
            <Link href="/dashboard" className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-bold text-white tracking-wider">
              My <span className="text-blue-500">Account</span>
            </Link>
          </div>

          {/* Center: Store Button */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link 
              href="/"
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all"
            >
              Go to Store
            </Link>
          </div>
          
          {/* Right: Orders & Logout */}
          <div className="flex flex-1 items-center justify-end gap-3 sm:gap-6">
            <Link 
              href="/dashboard/orders"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Package size={18} className="text-emerald-500 shrink-0" />
              <span className="hidden sm:inline">Orders</span>
            </Link>
            <div className="h-5 w-px bg-slate-800 shrink-0" />
            <div className="shrink-0">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-8 sm:py-12">
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
