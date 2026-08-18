import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

const geoCache = new Map<string, { country: string; city: string }>()

async function lookupGeo(ip: string) {
  if (geoCache.has(ip)) return geoCache.get(ip)!
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      signal: AbortSignal.timeout(3000),
    })
    const d = await res.json()
    if (d.status === "success") {
      const geo = { country: d.country ?? "", city: d.city ?? "" }
      geoCache.set(ip, geo)
      return geo
    }
  } catch {}
  return { country: "", city: "" }
}

function isPrivateIp(ip: string) {
  return !ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { event, sessionId, page = "", referrer = "", data = {} } = body

    if (!event || !sessionId) return NextResponse.json({ ok: true })

    const ua = req.headers.get("user-agent") ?? ""
    if (/bot|crawler|spider|scraper|curl|wget|python-requests|java\//i.test(ua)) {
      return NextResponse.json({ ok: true })
    }

    const ip = (
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      ""
    ).slice(0, 45)

    const device = /iPhone|Android(?!.*Tablet)|Mobile/i.test(ua) ? "mobile"
      : /iPad|Tablet|tablet/i.test(ua) ? "tablet"
      : "desktop"

    const browser = /Edg\//i.test(ua) ? "Edge"
      : /OPR\//i.test(ua) ? "Opera"
      : /Chrome/i.test(ua) ? "Chrome"
      : /Firefox/i.test(ua) ? "Firefox"
      : /Safari/i.test(ua) ? "Safari"
      : "Other"

    if (event === "pageview") {
      const pv = await prisma.pageView.create({
        data: { sessionId, ip, page: page.slice(0, 500), referrer: referrer.slice(0, 500), device, browser },
      })
      if (!isPrivateIp(ip)) {
        lookupGeo(ip).then(({ country, city }) => {
          if (country) prisma.pageView.update({ where: { id: pv.id }, data: { country, city } }).catch(() => {})
        }).catch(() => {})
      }
    } else {
      await prisma.analyticsEvent.create({
        data: { sessionId, ip, event, page: page.slice(0, 500), data },
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
