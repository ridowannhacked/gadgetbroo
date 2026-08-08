'use client';
import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
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
            className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800/60 transition-colors"
            aria-label="Open menu"
          >
            <MoreVertical size={20} />
          </button>
        </header>
        <main className="flex-1 px-4 md:px-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
