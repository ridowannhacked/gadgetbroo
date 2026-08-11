"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function StoreSidebarClient({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full md:w-64 flex-shrink-0 md:sticky md:top-24 self-start z-10">
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full flex items-center justify-center gap-2 bg-[#12151a] border border-slate-800 text-white py-3 px-4 rounded-xl font-medium mb-6 transition-colors hover:bg-slate-800"
      >
        <Search size={18} />
        {isOpen ? "Close Search & Categories" : "Search & Categories"}
      </button>

      {/* Sidebar Content */}
      <div className={`space-y-8 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1500px] opacity-100 mb-8' : 'max-h-0 opacity-0 md:max-h-none md:opacity-100 md:mb-0'}`}>
        {children}
      </div>
    </div>
  );
}
