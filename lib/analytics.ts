function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem("_sid")
  if (!id) {
    id = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem("_sid", id)
  }
  return id
}

function send(payload: Record<string, unknown>) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {})
}

export function trackPageView(page: string, referrer = "") {
  send({ event: "pageview", sessionId: getSessionId(), page, referrer })
}

export function trackEvent(event: string, data: Record<string, unknown> = {}) {
  const page = typeof window !== "undefined" ? window.location.pathname : ""
  send({ event, sessionId: getSessionId(), page, data })
}
