import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const distDir = resolve(projectRoot, 'dist')
const config = JSON.parse(await readFile(resolve(projectRoot, 'src/seo-pages.json'), 'utf8'))
const packageJson = JSON.parse(await readFile(resolve(projectRoot, 'package.json'), 'utf8'))
const baseHtml = await readFile(resolve(distDir, 'index.html'), 'utf8')

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const absoluteUrl = (path) => `${config.siteUrl}${path}`
const imageUrl = absoluteUrl(config.previewImage)
const logoUrl = absoluteUrl(config.logoImage)

const routeEntries = Object.entries(config.routes).flatMap(([key, route]) => (
  ['zh', 'en'].map((locale) => ({ key, locale, schemaType: route.schemaType, ...route[locale] }))
))

const routeByKey = (key, locale) => routeEntries.find((entry) => entry.key === key && entry.locale === locale)

const replaceMeta = (html, attribute, key, value) => {
  const expression = new RegExp(`<meta\\s+([^>]*${attribute}=["']${key}["'][^>]*)>`, 'i')
  const match = html.match(expression)
  if (!match) return html
  const updated = match[0].replace(/content=["'][^"']*["']/i, `content="${escapeHtml(value)}"`)
  return html.replace(match[0], updated)
}

const buildSchemas = (entry) => {
  const canonical = absoluteUrl(entry.path)
  const home = routeByKey('home', entry.locale)
  const homeUrl = absoluteUrl(home.path)
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': entry.schemaType,
    name: entry.title,
    description: entry.description,
    url: canonical,
    image: imageUrl,
    inLanguage: entry.locale === 'zh' ? 'zh-CN' : 'en',
    isPartOf: { '@type': 'WebSite', name: 'DrawStamp Studio', url: homeUrl },
    publisher: {
      '@type': 'Organization',
      name: 'DrawStamp Studio',
      url: config.siteUrl,
      logo: { '@type': 'ImageObject', url: logoUrl, width: 512, height: 512 },
      sameAs: ['https://github.com/fisher0627/DrawStamp_Studio', 'https://t.me/KEVIN627ZTZ']
    }
  }

  if (entry.key !== 'home') {
    pageSchema.breadcrumb = {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: entry.locale === 'zh' ? '首页' : 'Home', item: homeUrl },
        { '@type': 'ListItem', position: 2, name: entry.heading, item: canonical }
      ]
    }
  }

  const schemas = [{ id: 'route-page-schema', payload: pageSchema }]
  if (entry.key === 'home') {
    schemas.push({
      id: 'software-application-schema',
      payload: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'DrawStamp Studio',
        alternateName: entry.heading,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: canonical,
        image: imageUrl,
        screenshot: absoluteUrl('/readme-workspace.png'),
        inLanguage: entry.locale === 'zh' ? 'zh-CN' : 'en',
        softwareVersion: packageJson.version,
        isAccessibleForFree: true,
        description: entry.description,
        featureList: entry.highlights,
        publisher: { '@type': 'Organization', name: 'DrawStamp Studio', url: config.siteUrl, logo: logoUrl },
        license: 'https://github.com/fisher0627/DrawStamp_Studio/blob/main/LICENSE',
        offers: { '@type': 'Offer', price: '0', priceCurrency: entry.locale === 'zh' ? 'CNY' : 'USD' }
      }
    })
  }

  return schemas.map(({ id, payload }) => (
    `<script id="${id}" type="application/ld+json">${JSON.stringify(payload)}</script>`
  )).join('\n    ')
}

const buildStaticShell = (entry) => {
  const navigation = ['home', 'about', 'privacy', 'terms', 'contact']
    .map((key) => routeByKey(key, entry.locale))
    .map((item) => `<a href="${escapeHtml(item.path)}">${escapeHtml(item.heading)}</a>`)
    .join('')
  const highlights = entry.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')

  return `<div id="app"><main class="static-seo-shell"><header><img src="/logo-lockup.svg" alt="DrawStamp Studio" width="178" height="46"><p>${entry.locale === 'zh' ? '浏览器本地电子印章工作台' : 'Browser-local electronic stamp workspace'}</p><h1>${escapeHtml(entry.heading)}</h1><p>${escapeHtml(entry.summary)}</p></header><ul>${highlights}</ul><nav aria-label="${entry.locale === 'zh' ? '主要页面' : 'Primary pages'}">${navigation}</nav><p><a href="${entry.locale === 'zh' ? '/en/' : '/'}" hreflang="${entry.locale === 'zh' ? 'en' : 'zh-CN'}">${entry.locale === 'zh' ? 'English' : '中文'}</a></p></main></div>`
}

const renderPage = (entry) => {
  const alternate = routeByKey(entry.key, entry.locale === 'zh' ? 'en' : 'zh')
  const canonical = absoluteUrl(entry.path)
  const zhUrl = absoluteUrl(routeByKey(entry.key, 'zh').path)
  const enUrl = absoluteUrl(routeByKey(entry.key, 'en').path)
  let html = baseHtml

  html = html.replace(/<html\s+lang=["'][^"']+["']>/i, `<html lang="${entry.locale === 'zh' ? 'zh-CN' : 'en'}">`)
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(entry.title)}</title>`)
  html = replaceMeta(html, 'name', 'description', entry.description)
  html = replaceMeta(html, 'name', 'robots', 'index, follow')
  html = replaceMeta(html, 'http-equiv', 'content-language', entry.locale === 'zh' ? 'zh-CN' : 'en')
  html = replaceMeta(html, 'property', 'og:title', entry.title)
  html = replaceMeta(html, 'property', 'og:description', entry.description)
  html = replaceMeta(html, 'property', 'og:url', canonical)
  html = replaceMeta(html, 'property', 'og:locale', entry.locale === 'zh' ? 'zh_CN' : 'en_US')
  html = replaceMeta(html, 'property', 'og:locale:alternate', entry.locale === 'zh' ? 'en_US' : 'zh_CN')
  html = replaceMeta(html, 'name', 'twitter:title', entry.title)
  html = replaceMeta(html, 'name', 'twitter:description', entry.description)
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}">`)
  html = html.replace(/\s*<link\s+rel=["']alternate["'][^>]*>/gi, '')
  html = html.replace('</head>', `    <link rel="alternate" hreflang="zh-CN" href="${zhUrl}">\n    <link rel="alternate" hreflang="en" href="${enUrl}">\n    <link rel="alternate" hreflang="x-default" href="${zhUrl}">\n  </head>`)
  html = html.replace(/\s*<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
  html = html.replace('</head>', `    ${buildSchemas(entry)}\n  </head>`)
  html = html.replace(/<div\s+id=["']app["']>[\s\S]*?<\/div>/i, buildStaticShell(entry))
  html = html.replace(/<meta\s+name=["']keywords["'][^>]*>\s*/i, '')

  if (entry.locale === 'en' && alternate.path === entry.path) {
    throw new Error(`Locale paths must differ for ${entry.key}`)
  }

  return html
}

for (const entry of routeEntries) {
  const outputPath = entry.path === '/'
    ? resolve(distDir, 'index.html')
    : entry.path.endsWith('/')
      ? resolve(distDir, entry.path.replace(/^\//, '').replace(/\/$/, ''), 'index.html')
      : resolve(distDir, `${entry.path.replace(/^\//, '')}.html`)
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, renderPage(entry))
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routeEntries.map((entry) => {
  const zh = routeByKey(entry.key, 'zh')
  const en = routeByKey(entry.key, 'en')
  return `  <url>
    <loc>${absoluteUrl(entry.path)}</loc>
    <lastmod>${config.lastmod}</lastmod>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${absoluteUrl(zh.path)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${absoluteUrl(en.path)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(zh.path)}" />
  </url>`
}).join('\n')}
</urlset>
`
await writeFile(resolve(distDir, 'sitemap.xml'), sitemap)

const notFoundHtml = `<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, follow"><title>页面未找到 | DrawStamp Studio</title><link rel="icon" href="/favicon.svg"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#f4f5f1;color:#202522}.card{max-width:560px;margin:24px;padding:40px;border:1px solid #d9ddd6;border-radius:18px;background:#fff;box-shadow:0 18px 48px rgba(31,42,36,.08)}h1{margin:0 0 14px;font-size:clamp(32px,8vw,64px)}p{line-height:1.7;color:#667067}a{display:inline-block;margin-top:14px;color:#234c5c;font-weight:800}</style></head><body><main class="card"><p>404 / NOT FOUND</p><h1>页面未找到</h1><p>The page you requested does not exist. 您访问的页面不存在或已移动。</p><a href="/">返回 DrawStamp Studio / Back to home</a></main></body></html>`
await writeFile(resolve(distDir, '404.html'), notFoundHtml)

console.log(`Generated ${routeEntries.length} prerendered SEO pages, sitemap.xml, and 404.html`)
