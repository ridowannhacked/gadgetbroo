import { ReactNode } from "react";
import Link from "next/link";
import { User, Package, MapPin, LogOut } from "lucide-react";
import LogoutButton from "../../../components/logoutUser";

export default function CustomerDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070a12] text-slate-200 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 py-8 sm:py-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-[#0b0f19] border border-slate-800/60 rounded-2xl p-4 sticky top-8">
            <div className="mb-6 px-4">
              <h2 className="text-lg font-bold text-white tracking-wider">
                My Account
              </h2>
            </div>
            <nav className="flex flex-col gap-1">
              <Link 
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800/50 hover:text-white transition-colors"
              >
                <User size={18} className="text-blue-500" />
                Profile
              </Link>
              <Link 
                href="/dashboard/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800/50 hover:text-white transition-colors"
              >
                <Package size={18} className="text-emerald-500" />
                My Orders
              </Link>
              <div className="my-2 border-t border-slate-800/50" />
              <div className="px-4 py-2">
                <LogoutButton />
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
