import type { AppLocale } from './i18n'
import seoPages from './seo-pages.json'

type SeoRouteKey = keyof typeof seoPages.routes
type SeoRoute = {
  name?: unknown
  path: string
  meta?: { seoKey?: unknown }
}

const SITE_URL = seoPages.siteUrl
const PREVIEW_IMAGE = `${SITE_URL}${seoPages.previewImage}`
const LOGO_IMAGE = `${SITE_URL}${seoPages.logoImage}`

const getRouteKey = (route: SeoRoute): SeoRouteKey => {
  const key = route.meta?.seoKey
  return typeof key === 'string' && key in seoPages.routes ? key as SeoRouteKey : 'home'
}

const getPageCopy = (routeKey: SeoRouteKey, locale: AppLocale) => seoPages.routes[routeKey][locale]

const setMetaContent = (selector: string, content: string) => {
  document.querySelector(selector)?.setAttribute('content', content)
}

const setLinkHref = (rel: string, href: string, hreflang?: string) => {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`
  const existing = document.querySelector<HTMLLinkElement>(selector)
  const link = existing || document.createElement('link')
  link.rel = rel
  link.href = href
  if (hreflang) link.hreflang = hreflang
  if (!existing) document.head.appendChild(link)
}

const setJsonLd = (id: string, payload: object | null) => {
  const existing = document.getElementById(id)
  if (!payload) {
    existing?.remove()
    return
  }

  const script = existing || document.createElement('script')
  script.id = id
  script.setAttribute('type', 'application/ld+json')
  script.textContent = JSON.stringify(payload)
  if (!existing) document.head.appendChild(script)
}

export const applyRouteSeo = (route: SeoRoute, locale: AppLocale) => {
  const routeKey = getRouteKey(route)
  const copy = getPageCopy(routeKey, locale)
  const zhCopy = getPageCopy(routeKey, 'zh')
  const enCopy = getPageCopy(routeKey, 'en')
  const homeCopy = getPageCopy('home', locale)
  const languageTag = locale === 'zh' ? 'zh-CN' : 'en'
  const ogLocale = locale === 'zh' ? 'zh_CN' : 'en_US'
  const canonicalHref = `${SITE_URL}${copy.path}`
  const imageAlt = locale === 'zh'
    ? 'DrawStamp Studio 在线电子印章生成器预览'
    : 'DrawStamp Studio online stamp maker preview'

  document.documentElement.lang = languageTag
  document.title = copy.title
  setMetaContent('meta[http-equiv="content-language"]', languageTag)
  setMetaContent('meta[name="description"]', copy.description)
  setMetaContent('meta[property="og:title"]', copy.title)
  setMetaContent('meta[property="og:description"]', copy.description)
  setMetaContent('meta[property="og:url"]', canonicalHref)
  setMetaContent('meta[property="og:locale"]', ogLocale)
  setMetaContent('meta[property="og:locale:alternate"]', locale === 'zh' ? 'en_US' : 'zh_CN')
  setMetaContent('meta[property="og:image"]', PREVIEW_IMAGE)
  setMetaContent('meta[property="og:image:secure_url"]', PREVIEW_IMAGE)
  setMetaContent('meta[property="og:image:alt"]', imageAlt)
  setMetaContent('meta[name="twitter:title"]', copy.title)
  setMetaContent('meta[name="twitter:description"]', copy.description)
  setMetaContent('meta[name="twitter:image"]', PREVIEW_IMAGE)
  setMetaContent('meta[name="twitter:image:alt"]', imageAlt)
  setLinkHref('canonical', canonicalHref)
  setLinkHref('alternate', `${SITE_URL}${zhCopy.path}`, 'zh-CN')
  setLinkHref('alternate', `${SITE_URL}${enCopy.path}`, 'en')
  setLinkHref('alternate', `${SITE_URL}${zhCopy.path}`, 'x-default')

  const homeUrl = `${SITE_URL}${homeCopy.path}`
  const breadcrumbItems: object[] = [
    { '@type': 'ListItem', position: 1, name: locale === 'zh' ? '首页' : 'Home', item: homeUrl }
  ]
  if (routeKey !== 'home') {
    breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: copy.heading, item: canonicalHref })
  }

  setJsonLd('route-page-schema', {
    '@context': 'https://schema.org',
    '@type': seoPages.routes[routeKey].schemaType,
    name: copy.title,
    description: copy.description,
    url: canonicalHref,
    image: PREVIEW_IMAGE,
    inLanguage: languageTag,
    isPartOf: { '@type': 'WebSite', name: 'DrawStamp Studio', url: homeUrl },
    publisher: {
      '@type': 'Organization',
      name: 'DrawStamp Studio',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: LOGO_IMAGE, width: 512, height: 512 },
      sameAs: ['https://github.com/fisher0627/DrawStamp_Studio', 'https://t.me/KEVIN627ZTZ']
    },
    ...(routeKey === 'home' ? {} : {
      breadcrumb: { '@type': 'BreadcrumbList', itemListElement: breadcrumbItems }
    })
  })

  // Keep the useful visible FAQ content without publishing unsupported rich-result markup.
  setJsonLd('faq-schema', null)

  if (routeKey !== 'home') {
    setJsonLd('software-application-schema', null)
    return
  }

  setJsonLd('software-application-schema', {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DrawStamp Studio',
    alternateName: copy.heading,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: canonicalHref,
    image: PREVIEW_IMAGE,
    screenshot: `${SITE_URL}/readme-workspace.png`,
    inLanguage: languageTag,
    softwareVersion: __APP_VERSION__,
    isAccessibleForFree: true,
    description: copy.description,
    featureList: copy.highlights,
    publisher: { '@type': 'Organization', name: 'DrawStamp Studio', url: SITE_URL, logo: LOGO_IMAGE },
    license: 'https://github.com/fisher0627/DrawStamp_Studio/blob/main/LICENSE',
    offers: { '@type': 'Offer', price: '0', priceCurrency: locale === 'zh' ? 'CNY' : 'USD' }
  })
}
