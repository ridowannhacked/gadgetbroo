"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ShoppingCart, Loader2, FileText, ChevronRight, Search, Filter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type OrderSummary = {
  id: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  total: number;
  user: { name: string; email: string };
  _count: { items: number };
  items: { imageSnapshot: string | null; productName: string }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (statusFilter) query.set("status", statusFilter);
      
      const res = await fetch(`/api/orders?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      toast.error("Could not load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "CONFIRMED": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "PROCESSING": return "text-indigo-400 bg-indigo-400/10 border-indigo-400/20";
      case "SHIPPED": return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      case "DELIVERED": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "CANCELLED": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "REFUNDED": return "text-slate-400 bg-slate-400/10 border-slate-400/20";
      default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto mt-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="text-blue-500" />
            Orders
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage customer orders and fulfillment
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <Input
            placeholder="Search Order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0d1017] border-slate-800 text-slate-200"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2 bg-[#0d1017] border border-slate-800 text-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none h-10"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-800/60 rounded-xl bg-[#0d1017] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="border-b border-slate-800 text-slate-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Order / Product</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5 text-right">Total</th>
                <th className="px-5 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="animate-spin text-slate-500 mx-auto" size={24} />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <FileText size={32} className="opacity-40 mx-auto mb-3" />
                    <p className="text-sm">No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0a0a0a] rounded-md border border-slate-800 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                          {order.items?.[0]?.imageSnapshot ? (
                            <Image
                              src={`${order.items[0].imageSnapshot}?tr=w-100`}
                              alt="Product"
                              fill
                              unoptimized
                              className="object-contain p-1"
                            />
                          ) : (
                            <ShoppingCart className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-slate-200 font-medium truncate max-w-[150px]" title={order.items?.[0]?.productName || "Unknown"}>
                            {order.items?.[0]?.productName || "Product"}
                            {order._count.items > 1 && <span className="text-slate-500 text-xs ml-1">(+{order._count.items - 1})</span>}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                            #{order.id.slice(-8).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-200">{order.user.name}</div>
                      <div className="text-slate-500 mt-0.5">{order.user.email}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {format(new Date(order.createdAt), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                        order.paymentStatus === 'PAID' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                        order.paymentStatus === 'FAILED' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                        'text-amber-400 bg-amber-400/10 border-amber-400/20'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-slate-200">
                      ${Number(order.total).toFixed(2)}
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">{order._count.items} item(s)</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="View Order"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
