"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  ArrowLeft, Loader2, Package, Truck, CreditCard, 
  User, MapPin, Calendar, CheckCircle2, Save, FileText 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OrderDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [trackingNumber, setTrackingNumber] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      const data = await res.json();
      setOrder(data.order);
      setTrackingNumber(data.order.trackingNumber || "");
      setAdminNotes(data.order.adminNotes || "");
    } catch (error) {
      toast.error("Could not load order details");
      router.push("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const updateField = async (field: string, value: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error(`Failed to update ${field}`);
      toast.success("Order updated successfully");
      fetchOrder();
    } catch (error) {
      toast.error(`Failed to update order`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 mt-2 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Calendar size={12} />
              Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {/* Status Progression Dropdown */}
          <div className="relative">
            <select
              value={order.status}
              disabled={updating}
              onChange={(e) => updateField('status', e.target.value)}
              className="pl-3 pr-8 py-2 bg-[#0d1017] border border-slate-800 text-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none h-10 min-w-[140px] disabled:opacity-50"
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
            {updating && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400 pointer-events-none" />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0d1017] border border-slate-800/60 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Package size={16} className="text-blue-400" /> Items Ordered
            </h2>
            <div className="divide-y divide-slate-800/50">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                    {item.imageSnapshot ? (
                       // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={`${item.imageSnapshot}${item.imageSnapshot.includes('?') ? '&' : '?'}tr=w-200`} 
                        alt={item.productName} 
                        className="w-full h-full object-contain p-1 bg-white" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600"><Package size={20} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-200 truncate">{item.productName}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">{item.variantName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">SKU: {item.skuAtOrder}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-medium text-slate-200">${Number(item.priceAtOrder).toFixed(2)}</div>
                    <div className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-800/60 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Discount</span>
                  <span>-${Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-medium text-slate-200 pt-2 border-t border-slate-800/60">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Shipping Info */}
        <div className="space-y-6">
          <div className="bg-[#0d1017] border border-slate-800/60 rounded-xl p-5 shadow-sm">
             <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <User size={16} className="text-purple-400" /> Customer Info
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">Name</div>
                <div className="text-slate-300 font-medium">{order.user.name}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">Email</div>
                <div className="text-slate-300">{order.user.email}</div>
              </div>
            </div>
          </div>

          <div className="bg-[#0d1017] border border-slate-800/60 rounded-xl p-5 shadow-sm">
             <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-emerald-400" /> Shipping Address
            </h2>
            <div className="space-y-1 text-sm text-slate-300">
              <div className="font-medium">{order.address.fullName}</div>
              <div>{order.address.line1}</div>
              {order.address.line2 && <div>{order.address.line2}</div>}
              <div>{order.address.city}, {order.address.state} {order.address.postalCode}</div>
              <div>{order.address.country}</div>
              <div className="pt-2 text-slate-400 flex items-center gap-2">
                Phone: {order.address.phone}
              </div>
            </div>
          </div>

          <div className="bg-[#0d1017] border border-slate-800/60 rounded-xl p-5 shadow-sm">
             <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-amber-400" /> Payment Details
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">Method</div>
                <div className="text-slate-300 capitalize">{order.paymentMethod.replace(/_/g, ' ').toLowerCase()}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Status</div>
                <div className="relative max-w-[160px]">
                  <select
                    value={order.paymentStatus}
                    disabled={updating}
                    onChange={(e) => updateField('paymentStatus', e.target.value)}
                    className="w-full pl-3 pr-8 py-1.5 bg-[#0a0a0a] border border-slate-800 text-slate-200 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50"
                  >
                    <option value="UNPAID">UNPAID</option>
                    <option value="PAID">PAID</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0d1017] border border-slate-800/60 rounded-xl p-5 shadow-sm">
             <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Truck size={16} className="text-blue-400" /> Fulfillment
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">Tracking Number</div>
                <div className="flex gap-2">
                  <Input 
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. STEADFAST-1234"
                    className="bg-[#0a0a0a] border-slate-800 text-white h-9 text-xs"
                  />
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => updateField('trackingNumber', trackingNumber)}
                    disabled={updating || trackingNumber === (order.trackingNumber || "")}
                    className="h-9 px-3 shrink-0"
                  >
                    <Save size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0d1017] border border-slate-800/60 rounded-xl p-5 shadow-sm">
             <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <FileText size={16} className="text-slate-400" /> Admin Notes
            </h2>
            <div className="space-y-3">
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this order..."
                className="w-full h-24 bg-[#0a0a0a] border border-slate-800 rounded-md p-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => updateField('adminNotes', adminNotes)}
                disabled={updating || adminNotes === (order.adminNotes || "")}
                className="w-full gap-2 text-xs h-8"
              >
                <Save size={14} /> Save Notes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
