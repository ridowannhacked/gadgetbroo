import { getServerSession } from "@/helpers/get-servesession";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Package, Truck, FileText, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyOrdersPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/sign-in");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { variant: { include: { product: true } } }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">My Orders</h1>
        <p className="text-sm text-slate-400 mt-1">Track and view your recent purchases.</p>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-[#0b0f19] border border-dashed border-slate-800/60 rounded-2xl py-16 text-center text-slate-500">
            <Package size={32} className="mx-auto mb-3 opacity-40" />
            <p>You haven&apos;t placed any orders yet.</p>
            <Link href="/store" className="inline-block mt-4 text-blue-500 hover:text-blue-400 font-medium">
              Start Shopping &rarr;
            </Link>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-[#0b0f19] border border-slate-800/60 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-slate-900/30 px-6 py-4 border-b border-slate-800/60 flex flex-wrap gap-6 justify-between items-center text-sm">
                <div className="flex flex-wrap gap-8">
                  <div>
                    <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">Order Placed</div>
                    <div className="text-slate-300 font-medium">{format(new Date(order.createdAt), "MMM d, yyyy")}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">Total</div>
                    <div className="text-slate-300 font-medium">৳{Number(order.total).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">Order #</div>
                    <div className="text-slate-300 font-medium font-mono">{order.id.slice(-8).toUpperCase()}</div>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    order.status === 'DELIVERED' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                    order.status === 'SHIPPED' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                    order.status === 'CANCELLED' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                    'text-amber-400 bg-amber-400/10 border-amber-400/20'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items & Tracking */}
              <div className="p-6">
                {order.trackingNumber && (
                  <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-4">
                    <Truck className="text-blue-400 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-400">Tracking Information</h4>
                      <p className="text-slate-300 text-sm mt-1">
                        Your tracking number is: <span className="font-mono font-bold">{order.trackingNumber}</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700/50">
                        {item.imageSnapshot ? (
                          <Image src={`${item.imageSnapshot}?tr=w-100`} alt={item.productName} fill sizes="80px" className="object-contain p-1" />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400"><Package size={20} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.variant.product.slug}`} className="text-sm font-medium text-blue-400 hover:underline truncate block">
                          {item.productName}
                        </Link>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.variantName}</p>
                        <p className="text-xs text-slate-300 mt-1">Qty: {item.quantity} × ৳{Number(item.priceAtOrder).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
