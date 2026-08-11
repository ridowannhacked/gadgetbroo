// components/admin/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart,
  Tag, Image, Shield, Users, User, LogOut, X, Star, Truck
} from 'lucide-react';
import { handleSignOut } from '../../helpers/signout';
import { toast } from 'sonner';
import { useAuthSession, hasPermission } from '../auth/AuthSessionProvider';

// ── Nav item definition ───────────────────────────────────────────────────────
// `resource` matches the Permission.resource values in the DB.
// `resource: null` means the link is always visible (e.g. Dashboard).
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin",         resource: null },
  { label: "Category",  icon: Tag,             href: "/admin/category", resource: "Categories" },
  { label: "Products",  icon: Package,         href: "/admin/products", resource: "Products" },
  { label: "Orders",    icon: ShoppingCart,    href: "/admin/orders",   resource: "Orders" },
  { label: "Shipping",  icon: Truck,           href: "/admin/shipping", resource: "Shipping" },
  { label: "Reviews",   icon: Star,            href: "/admin/reviews",  resource: "Reviews" },
  { label: "Banners",   icon: Image,           href: "/admin/site-media", resource: null }, // Null means all admins can access
  { label: "Media",     icon: Image,           href: "/admin/media",    resource: "Media" },
  { label: "Users",     icon: Users,           href: "/admin/users",    resource: "Users" },
  { label: "Roles",     icon: Shield,          href: "/admin/roles",    resource: "Roles" },
] as const;

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { fullUser } = useAuthSession();

  const isAdmin = fullUser?.role?.name === 'admin';
  const permissions = fullUser?.role?.permissions ?? [];

  /** Returns true if this nav item should be rendered for the current user */
  function canSeeLink(resource: string | null): boolean {
    // Dashboard is always visible
    if (resource === null) return true;
    // Super-admin bypasses all permission checks
    if (isAdmin) return true;
    // Otherwise check canView in the Permission table
    return hasPermission(permissions, resource, 'canView');
  }

  const signoutUser = async () => {
    try {
      await handleSignOut();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logout failed");
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-3 lg:p-4">
      <div className="space-y-6 overflow-y-auto">
        {/* Brand Logo Header */}
        <div className="px-2 py-2 flex items-center justify-between">
          <div>
            <Link href='/'>
              <h1 className="text-lg lg:text-xl font-bold tracking-wider text-white">
                G<span className="hidden lg:inline">ADGET</span>
                <span className="text-blue-500">B<span className="hidden lg:inline">ROO</span></span>
              </h1>
            </Link>
            <p className="text-[10px] lg:text-[11px] text-gray-500 hidden lg:block">Admin Panel</p>
          </div>
          {/* Close button on mobile overlay */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Primary Navigation — filtered by canView permissions */}
        <nav className="space-y-1">
          {NAV_ITEMS.filter((item) => canSeeLink(item.resource)).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                title={item.label}
                className={`group relative flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="hidden lg:inline truncate">{item.label}</span>

                {/* Tablet Tooltip */}
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity lg:hidden z-50 whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role badge — shows the current user's role name */}
      {fullUser?.role && (
        <div className="px-3 pb-1">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700 truncate max-w-full">
            <Shield size={10} className="text-blue-400 shrink-0" />
            <span className="truncate">{fullUser.role.name}</span>
          </span>
        </div>
      )}

      {/* Profile & Sign Out Section */}
      <div className="border-t border-gray-800/50 pt-4 space-y-1">
        {isAdmin && (
          <Link
            href="/admin/profile"
            onClick={() => setMobileMenuOpen(false)}
            title="Profile"
            className="flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 transition-colors"
          >
            <User size={18} className="shrink-0" />
            <span className="hidden lg:inline">Profile</span>
          </Link>
        )}
        <button
          title="Sign Out"
          className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left"
          onClick={signoutUser}
        >
          <LogOut size={18} className="shrink-0" />
          <span className="hidden lg:inline">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop & Tablet Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-16 lg:w-64 bg-[#070a12]/80 backdrop-blur-md border-r border-gray-800/50 h-full transition-all duration-300 shrink-0">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 3. Mobile Slide-Over Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#070a12] z-50 transform transition-transform duration-300 ease-in-out md:hidden border-r border-gray-800/50 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
