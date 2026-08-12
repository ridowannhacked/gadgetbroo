"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  
  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for tracking order will be added here
    alert(`Tracking order: ${orderId}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-lg mx-auto bg-[#0f1219] rounded-2xl border border-slate-800 p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Track Your Order</h1>
          <p className="text-slate-400">Enter your order ID to see the current status of your shipment.</p>
        </div>
        
        <form onSubmit={handleTrack} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="orderId" className="text-sm font-medium text-slate-300">
              Order ID
            </label>
            <div className="relative">
              <input
                id="orderId"
                type="text"
                placeholder="e.g. #ORD-123456"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
                className="w-full bg-[#0a0a0a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pl-11"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl h-auto"
          >
            Track Order
          </Button>
        </form>
      </div>
    </div>
  );
}
