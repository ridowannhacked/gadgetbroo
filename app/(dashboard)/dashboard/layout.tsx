import { ReactNode } from "react";
import Link from "next/link";
import { User, Package, MapPin, LogOut, Store } from "lucide-react";
import LogoutButton from "../../../components/logoutUser";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Top Navbar for Dashboard */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 relative">
          
          {/* Left: Logo */}
          <div className="flex flex-1 items-center">
            <Link href="/dashboard" className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-bold text-foreground tracking-wider">
              <User size={20} className="sm:hidden" />
              <span className="hidden sm:inline">My <span className="text-primary">Account</span></span>
            </Link>
          </div>

          {/* Center: Store Button */}
          <div className="flex items-center justify-center mx-2 sm:mx-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-6 py-1.5 sm:py-2 rounded-full shadow-lg shadow-primary/30 transition-all"
            >
              <Store size={16} className="sm:hidden" />
              <span className="hidden sm:inline">Go to Store</span>
            </Link>
          </div>
          
          {/* Right: Orders, Addresses, Settings, Logout */}
          <div className="flex flex-1 items-center justify-end gap-3 sm:gap-6">
            <ThemeToggle />
            <Link 
              href="/dashboard/orders"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Package size={18} className="text-emerald-500 shrink-0" />
              <span className="hidden lg:inline">Orders</span>
            </Link>
            <Link 
              href="/dashboard/addresses"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <MapPin size={18} className="text-amber-500 shrink-0" />
              <span className="hidden lg:inline">Addresses</span>
            </Link>
            <Link 
              href="/dashboard/settings"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <User size={18} className="text-sky-500 shrink-0" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
            <div className="h-5 w-px bg-border shrink-0" />
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
