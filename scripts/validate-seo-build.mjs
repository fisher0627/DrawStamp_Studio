import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const distDir = resolve(projectRoot, 'dist')
const config = JSON.parse(await readFile(resolve(projectRoot, 'src/seo-pages.json'), 'utf8'))

const failures = []
const assert = (condition, message) => {
  if (!condition) failures.push(message)
}
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')
const absoluteUrl = (path) => `${config.siteUrl}${path}`
const outputPathFor = (path) => path === '/'
  ? resolve(distDir, 'index.html')
  : path.endsWith('/')
    ? resolve(distDir, path.replace(/^\//, '').replace(/\/$/, ''), 'index.html')
    : resolve(distDir, `${path.replace(/^\//, '')}.html`)

const entries = Object.entries(config.routes).flatMap(([key, route]) => (
  ['zh', 'en'].map((locale) => ({ key, locale, ...route[locale] }))
))

for (const entry of entries) {
  const html = await readFile(outputPathFor(entry.path), 'utf8')
  const otherLocale = entry.locale === 'zh' ? 'en' : 'zh'
  const alternate = config.routes[entry.key][otherLocale]
  const canonical = absoluteUrl(entry.path)

  assert(html.includes(`<html lang="${entry.locale === 'zh' ? 'zh-CN' : 'en'}">`), `${entry.path}: document language is incorrect`)
  assert(html.includes(`<title>${escapeHtml(entry.title)}</title>`), `${entry.path}: title is incorrect`)
  assert(html.includes(`<link rel="canonical" href="${canonical}">`), `${entry.path}: canonical is incorrect`)
  assert(html.includes(`<h1>${entry.heading}</h1>`), `${entry.path}: static H1 is missing`)
  assert(html.includes(`hreflang="${otherLocale === 'zh' ? 'zh-CN' : 'en'}" href="${absoluteUrl(alternate.path)}"`), `${entry.path}: alternate locale is incorrect`)
  assert(!/name=["']keywords["']/i.test(html), `${entry.path}: obsolete keywords meta remains`)
  assert(!html.includes('FAQPage'), `${entry.path}: unsupported FAQ schema remains`)

  const schemas = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  assert(schemas.length === (entry.key === 'home' ? 2 : 1), `${entry.path}: unexpected JSON-LD schema count`)
  for (const [, payload] of schemas) {
    try {
      JSON.parse(payload)
    } catch {
      failures.push(`${entry.path}: invalid JSON-LD payload`)
    }
  }
}

const sitemap = await readFile(resolve(distDir, 'sitemap.xml'), 'utf8')
assert((sitemap.match(/<url>/g) || []).length === entries.length, 'sitemap.xml: URL count does not match prerendered pages')
for (const entry of entries) {
  assert(sitemap.includes(`<loc>${absoluteUrl(entry.path)}</loc>`), `sitemap.xml: missing ${entry.path}`)
}

const notFound = await readFile(resolve(distDir, '404.html'), 'utf8')
assert(/name="robots" content="noindex, follow"/i.test(notFound), '404.html: noindex directive is missing')

if (failures.length) {
  throw new Error(`SEO build validation failed:\n- ${failures.join('\n- ')}`)
}

console.log(`Validated ${entries.length} SEO pages, sitemap.xml, JSON-LD, and 404.html`)
