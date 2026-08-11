import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from '../helpers/get-servesession';
import prisma from '../lib/prisma';
import CartIcon from './storefront/CartIcon';
import { User as UserIcon, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import StoreSearch from './storefront/StoreSearch';
import LogoutButton from './logoutUser';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

export default async function Navbar() {
  const session = await getServerSession();
  const user = session?.user;

  let fullUser = null;
  if (user?.id) {
    fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/60 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-wider text-white">
              G<span className="hidden sm:inline">ADGET</span>
              <span className="text-blue-500">B<span className="hidden sm:inline">ROO</span></span>
            </h1>
          </Link>

          {/* Desktop Links - "Apple Style" */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <Link href="/store" className="hover:text-white transition-colors">Store</Link>
            <Link href="/mac" className="hover:text-white transition-colors">Mac</Link>
            <Link href="/ipad" className="hover:text-white transition-colors">iPad</Link>
            <Link href="/iphone" className="hover:text-white transition-colors">iPhone</Link>
            <Link href="/accessories" className="hover:text-white transition-colors">Accessories</Link>
          </nav>
        </div>

        {/* Global Search Bar (Desktop) */}
        <div className="hidden sm:block flex-1 max-w-xl mx-8">
          <StoreSearch />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">

          <CartIcon />

          {!user ? (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white hover:bg-white/10 h-8">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-500 text-white h-8 hidden sm:flex">
                  Sign Up
                </Button>
              </Link>
            </div>
          ) : (
            <div className="ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 hover:ring-2 hover:ring-slate-600 outline-none transition-all">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt={user.name || "User"} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <UserIcon size={16} className="text-slate-400" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#0f1219] border-slate-800 text-slate-200">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                      <p className="text-xs leading-none text-slate-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-800" />
                  
                  {fullUser?.role?.name === 'admin' && (
                    <DropdownMenuItem asChild className="hover:bg-slate-800 cursor-pointer focus:bg-slate-800">
                      <Link href="/admin" className="flex items-center gap-2">
                        <LayoutDashboard size={14} className="text-blue-400" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem asChild className="hover:bg-slate-800 cursor-pointer focus:bg-slate-800">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <UserIcon size={14} />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-slate-800" />
                  <div className="p-1">
                    <LogoutButton />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
