'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { ThemeToggle } from '../ThemeToggle';
import { Menu } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="px-4 md:px-8 pt-4 md:pt-6 pb-2 flex items-center justify-between text-xs text-gray-400 font-medium">
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center p-1.5 -ml-1.5 rounded-lg hover:bg-accent text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu size={24} className="text-foreground" />
            </button>
            <Link href="/" className="flex items-center">
              <h1 className="text-lg font-bold tracking-wider text-foreground">
                G<span className="hidden sm:inline">ADGET</span>
                <span className="text-primary">B<span className="hidden sm:inline">ROO</span></span>
              </h1>
            </Link>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 px-4 md:px-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
