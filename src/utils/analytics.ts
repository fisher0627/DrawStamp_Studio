// Deliberately accept only fixed product states, never document text or file names.
type EventName = 'guide_open_tool' | 'extract_start' | 'extract_success' | 'export_start' | 'export_success' | 'library_save'
type EventData = { guide?: string; format?: string; mode?: string; source?: string }
type Payload = Record<string, unknown>
type Tracker = { track: (payload: (defaults: Payload) => Payload) => unknown }
const guides = ['extractTransparentStamp', 'roundSealTemplate', 'svgStampExport']
const paths = ['/', '/about', '/privacy', '/terms', '/contact', '/extract-transparent-stamp', '/round-company-seal-template', '/svg-stamp-export']
const safePath = (path: string) => {
  const base = path.replace(/^\/en(?=\/|$)/, '') || '/'
  return paths.includes(base) ? path : '/'
}
const pending: Array<{ name: EventName; data: Record<string, string>; path: string }> = []
let landing = ''
let lastGuide = ''
let listening = false

export function initializeAnalytics() {
  if (typeof window !== 'undefined') landing = safePath(window.location.pathname)
}

export function trackEvent(name: EventName, values: EventData = {}) {
  if (typeof window === 'undefined' || window.location.hostname !== 'wosp.cc.cd' || navigator.doNotTrack === '1') return
  if (!['guide_open_tool', 'extract_start', 'extract_success', 'export_start', 'export_success', 'library_save'].includes(name)) return
  landing ||= safePath(window.location.pathname)
  const queryGuide = new URLSearchParams(window.location.search).get('guide') || ''
  const guide = guides.includes(values.guide || '') ? values.guide! : guides.includes(queryGuide) ? queryGuide : lastGuide
  if (guide) lastGuide = guide
  const data: Record<string, string> = { landing, language: window.location.pathname.startsWith('/en/') ? 'en' : 'zh' }
  if (guide) data.guide = guide
  for (const [key, allowed] of Object.entries({ format: ['png', 'jpeg', 'svg'], mode: ['physical', 'pixels'], source: ['quick', 'dialog'] })) {
    const value = values[key as keyof EventData]
    if (value && allowed.includes(value)) data[key] = value
  }
  pending.push({ name, data, path: safePath(window.location.pathname) })
  if (pending.length > 20) pending.shift()
  flush()
  if (!listening) {
    listening = true
    document.getElementById('site-analytics')?.addEventListener('load', flush, { once: true })
  }
}

function flush() {
  const tracker = (window as Window & { umami?: Tracker }).umami
  if (!tracker?.track) return
  for (const event of pending.splice(0)) {
    try {
      // Avoid carrying free-form query strings into event URLs or referrers.
      const request = tracker.track(defaults => {
        let referrer = ''
        try { referrer = new URL(String(defaults.referrer || '')).origin } catch { /* Direct visit. */ }
        return { ...defaults, url: event.path, referrer, name: event.name, data: event.data }
      })
      void Promise.resolve(request).catch(() => {})
    } catch { /* Analytics must never interrupt editing, saving or downloading. */ }
  }
}
