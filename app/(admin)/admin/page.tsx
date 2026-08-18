import prisma from "@/lib/prisma"
import { ShoppingBag, Package, Tag, Clock } from "lucide-react"
import Link from "next/link"
import AnalyticsSection from "./(dashboard)/components/AnalyticsSection"
import { checkPermission } from "@/lib/rbac"

export default async function AdminDashboard() {
  const session = await checkPermission("Dashboard", "canView")
  const canViewAnalytics = session !== null

  const [totalOrders, pendingOrders, totalProducts, totalCategories] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count(),
    prisma.category.count(),
  ])

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const stats = [
    { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "bg-primary/10 text-primary" },
    { label: "Pending Orders", value: pendingOrders, icon: Clock, color: "bg-warning/10 text-warning" },
    { label: "Products", value: totalProducts, icon: Package, color: "bg-success/10 text-success" },
    { label: "Categories", value: totalCategories, icon: Tag, color: "bg-accent/10 text-accent" },
  ]

  const statusColors: Record<string, string> = {
    PENDING: "bg-warning/10 text-warning",
    CONFIRMED: "bg-primary/10 text-primary",
    PROCESSING: "bg-primary/10 text-primary",
    SHIPPED: "bg-accent/10 text-accent",
    DELIVERED: "bg-success/10 text-success",
    CANCELLED: "bg-destructive/10 text-destructive",
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Analytics Section - Only visible if user has analytics permission */}
      {canViewAnalytics && <AnalyticsSection />}

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-primary hover:underline font-medium">View All →</Link>
        </div>
        <div className="divide-y divide-border">
          {recentOrders.length === 0 && (
            <p className="px-5 py-6 text-muted-foreground text-sm text-center">No orders yet.</p>
          )}
          {recentOrders.map((order) => (
            <div key={order.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
              <div>
                <p className="text-sm font-medium text-foreground">{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">{order.customerName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">৳{Number(order.total).toFixed(0)}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] ?? "bg-muted text-muted-foreground"}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
