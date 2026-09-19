# SEO and usage measurement — 2026-09-19

## Release and scope

v0.8.1 changes font startup, the Chinese/English extraction guides, direct tool links and anonymous product events. Baseline commit: `537b989` (v0.8.0). No URL migrations, indexing-control changes, webmaster submissions or new analytics providers.

Before: the default home requested `STLiti-BiGNrQmg.woff2` (2,441,976 bytes), and startup waited for unused local-font enumeration and unconditional font loading. After: the default document does not request this font; selecting a Li-style font or opening a saved document that uses it loads it, redraws the canvas and awaits it before export. Font option labels use UI fonts until selected. This is a resource/startup change, not evidence of field Core Web Vitals or ranking improvement.

## Event definitions

Existing Umami website: production `wosp.cc.cd` only. No new account or custom user ID. Local previews and browser Do Not Track are excluded. URL search/hash parameters are excluded; event referrers are reduced to origin. A bounded in-memory queue handles the tracker loading late, without network retries. Blocking analytics never blocks editing.

| Event | Trigger | Additional allowed fields |
|---|---|---|
| `guide_open_tool` | User clicks a guide's tool link | `guide` |
| `extract_start` | Extraction window opens | — |
| `extract_success` | Extracted result is accepted onto the canvas | — |
| `export_start` | Export dialog or quick export starts | `source` for quick export |
| `export_success` | Image generated and browser download initiated | `format`, `mode`, `source` |
| `library_save` | Current document successfully written to IndexedDB | — |

Success does not mean a user completed an OS file save or approved the image. Automatic extraction previews, slider changes, failed exports and library duplicate operations are not counted as successful user tasks.

All events include allowlisted `landing` and `language`; `guide` is the last recognized guide in the current app lifetime, or an allowlisted guide in a direct tool URL. Nothing persists beyond the page lifetime. Unknown event fields and values are discarded. No company name, entered text, filename, image, document config, library ID or local-font list is sent. Existing Umami pageview metadata still applies.

## Viewing results

In the existing Umami dashboard, use the event names above. Filter by search-engine referrer and landing page, then compare guide entry, tool start and success. Use distinct sessions rather than dividing raw repeated success counts by pageviews. Separate Chinese/English and mobile/desktop. Direct tool reloads may count another start, intentionally; successful operations count per completed action.

Search Console access/data was not available during this change. The code does not prove indexing, traffic or ranking. With property access, check the 16 sitemap URLs in Page indexing and representative URLs in URL inspection, then compare search clicks/impressions by page, query, language and device. Search Console and Umami scopes differ; do not equate their counts.

Observe at least 28 days; if volume is low, extend the window and report insufficient evidence. Because several changes ship together, before/after movement is observational, not a controlled causal experiment. Do not attribute it to SEO alone.

## Verification and rollback

- `npm test`: selected-font behavior; privacy allowlist, delayed analytics and failures; export metadata.
- `npm run build`: 16 prerendered pages, canonical/alternate signals, JSON-LD, guide images/tool links, sitemap and 404.
- Browser: default page does not request Li font; selected Li font loads and export succeeds; both languages open the requested tool; synthetic extraction example and mobile guide work.
- Production: check deployment commit, asset version and rendered guide. Browser event inspection should stub the tracker and block its script so QA actions do not pollute live metrics.
- Roll back with a targeted revert of this release if font parity or key flows regress; retain v0.8.0 features and existing URLs.

Current official tracker API/configuration reviewed 2026-09-19: [functions](https://docs.umami.is/docs/tracker-functions), [configuration](https://docs.umami.is/docs/tracker-configuration). No new search-engine ranking claims or AI-search-specific rules are introduced.
