'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#0b0f19] text-gray-200 overflow-hidden font-sans">
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="px-4 md:px-8 pt-4 md:pt-6 pb-2 flex items-center justify-between text-xs text-gray-400 font-medium">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center gap-2"
            aria-label="Open menu"
          >
            <h1 className="text-lg font-bold tracking-wider text-white">
              G<span className="hidden sm:inline">ADGET</span>
              <span className="text-blue-500">B<span className="hidden sm:inline">ROO</span></span>
            </h1>
          </button>
        </header>
        <main className="flex-1 px-4 md:px-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
