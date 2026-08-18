"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { trackPageView } from "@/lib/analytics"

export default function VisitorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    trackPageView(pathname, document.referrer)
  }, [pathname])

  return null
}
