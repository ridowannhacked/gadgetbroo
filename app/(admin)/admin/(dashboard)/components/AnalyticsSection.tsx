"use client"

import { useEffect, useState } from "react"
import { Eye, Users, ShoppingCart, CreditCard, Package, Monitor, Smartphone, Tablet } from "lucide-react"
import Link from "next/link"

type AnalyticsData = {
  overview: { pageViews: number; uniqueVisitors: number; cartEvents: number; checkoutEvents: number; orders: number }
  topPages:  { page: string; views: number }[]
  countries: { country: string; views: number }[]
  devices:   Record<string, number>
  visitors: {
    sessionId: string; ip: string; country: string; city: string
    device: string; browser: string; pageCount: number
    lastPage: string; lastSeen: string; hasCart: boolean; hasCheckout: boolean
  }[]
}

const RANGES = [
  { value: "today", label: "Today" },
  { value: "7d",    label: "7 Days" },
  { value: "30d",   label: "30 Days" },
  { value: "all",   label: "All Time" },
]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function Bar({ value, max, color = "bg-primary" }: { value: number; max: number; color?: string }) {
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </div>
  )
}

export default function AnalyticsSection() {
  const [range, setRange]   = useState("7d")
  const [data, setData]     = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics?range=${range}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [range])

  const ov = data?.overview
  const deviceTotal = Object.values(data?.devices ?? {}).reduce((a, b) => a + b, 0)

  const funnel = ov
    ? [
        { label: "Visitors",     value: ov.uniqueVisitors, color: "bg-primary" },
        { label: "Add to Cart",  value: ov.cartEvents,     color: "bg-warning" },
        { label: "Checkout",     value: ov.checkoutEvents, color: "bg-accent"  },
        { label: "Orders",       value: ov.orders,         color: "bg-success" },
      ]
    : []

  return (
    <div className="space-y-5">
      {/* Header with Range tabs */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Analytics Overview</h2>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {RANGES.map((r) => (
            <button key={r.value} onClick={() => setRange(r.value)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${range === r.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Page Views",       value: ov?.pageViews      ?? 0, Icon: Eye,          cls: "bg-primary/10 text-primary"  },
              { label: "Unique Visitors",  value: ov?.uniqueVisitors ?? 0, Icon: Users,        cls: "bg-success/10 text-success"  },
              { label: "Add to Cart",      value: ov?.cartEvents     ?? 0, Icon: ShoppingCart, cls: "bg-warning/10 text-warning"  },
              { label: "Checkout",         value: ov?.checkoutEvents ?? 0, Icon: CreditCard,   cls: "bg-accent/10 text-accent"    },
              { label: "Orders Placed",    value: ov?.orders         ?? 0, Icon: Package,      cls: "bg-primary/10 text-primary"  },
            ].map(({ label, value, Icon, cls }) => (
              <div key={label} className="bg-card border border-border rounded-lg p-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${cls}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Funnel + Devices */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">Conversion Funnel</h2>
              <div className="space-y-4">
                {funnel.map(({ label, value, color }, i) => {
                  const pct = funnel[0].value ? (value / funnel[0].value) * 100 : 0
                  const fromPrev = i > 0 && funnel[i - 1].value
                    ? ((value / funnel[i - 1].value) * 100).toFixed(1)
                    : null
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-foreground">{label}</span>
                        <div className="flex items-center gap-2">
                          {fromPrev && <span className="text-xs text-muted-foreground">{fromPrev}% of prev</span>}
                          <span className="font-bold text-foreground">{value.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">Devices</h2>
              <div className="space-y-4">
                {([["mobile","Mobile",Smartphone],["desktop","Desktop",Monitor],["tablet","Tablet",Tablet]] as const).map(
                  ([key, label, Icon]) => {
                    const count = data?.devices?.[key] ?? 0
                    const pct = deviceTotal ? (count / deviceTotal) * 100 : 0
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground">{label}</span>
                            <span className="text-muted-foreground">{pct.toFixed(1)}% · {count.toLocaleString()}</span>
                          </div>
                          <Bar value={count} max={deviceTotal} />
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            </div>
          </div>

          {/* Top Pages + Countries */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Top Pages</h2>
                <Link href="/admin/analytics/pages" className="text-xs text-primary hover:underline font-medium">See All →</Link>
              </div>
              {(data?.topPages.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              ) : (
                <div className="space-y-3">
                  {data!.topPages.map(({ page, views }) => (
                    <div key={page}>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground truncate mr-2 max-w-[75%]">{page || "/"}</span>
                        <span className="text-muted-foreground shrink-0">{views.toLocaleString()}</span>
                      </div>
                      <Bar value={views} max={data!.topPages[0].views} color="bg-primary/60" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">Top Countries</h2>
                <Link href="/admin/analytics/countries" className="text-xs text-primary hover:underline font-medium">See All →</Link>
              </div>
              {(data?.countries.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No location data yet.</p>
              ) : (
                <div className="space-y-3">
                  {data!.countries.map(({ country, views }) => (
                    <div key={country}>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{country}</span>
                        <span className="text-muted-foreground">{views.toLocaleString()}</span>
                      </div>
                      <Bar value={views} max={data!.countries[0].views} color="bg-success/70" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Visitors */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Recent Visitors</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{data?.visitors.length ?? 0} shown</span>
                <Link href="/admin/analytics/visitors" className="text-xs text-primary hover:underline font-medium">See All →</Link>
              </div>
            </div>
            {(data?.visitors.length ?? 0) === 0 ? (
              <p className="px-5 py-8 text-sm text-muted-foreground text-center">No visitor data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["IP","Location","Device","Pages","Last Page","Events","Last Seen"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data!.visitors.map((v) => (
                      <tr key={v.sessionId} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                          {v.ip ? v.ip.split(".").slice(0, 3).join(".") + ".×" : "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          {v.country
                            ? <span className="text-foreground">{[v.city, v.country].filter(Boolean).join(", ")}</span>
                            : <span className="text-muted-foreground">Unknown</span>}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground capitalize">{v.device} · {v.browser}</td>
                        <td className="px-4 py-2.5 font-semibold text-foreground">{v.pageCount}</td>
                        <td className="px-4 py-2.5 text-muted-foreground max-w-[180px] truncate text-xs">{v.lastPage || "/"}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1 flex-wrap">
                            {v.hasCart     && <span className="text-xs bg-warning/10 text-warning px-1.5 py-0.5 rounded font-medium">Cart</span>}
                            {v.hasCheckout && <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium">Checkout</span>}
                            {!v.hasCart && !v.hasCheckout && <span className="text-xs text-muted-foreground">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap">{timeAgo(v.lastSeen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
