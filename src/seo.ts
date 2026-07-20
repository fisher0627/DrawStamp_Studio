import type { AppLocale } from './i18n'

const SITE_URL = 'https://wosp.cc.cd'
const PREVIEW_IMAGE = `${SITE_URL}/social-preview.png`
const LOGO_IMAGE = `${SITE_URL}/icon-512.png`

type SeoRouteKey = 'home' | 'about' | 'privacy' | 'terms' | 'contact'

interface RouteSeoCopy {
  title: string
  description: string
  keywords: string
  schemaType: 'WebPage' | 'AboutPage' | 'ContactPage'
}

const routeSeo: Record<AppLocale, Record<SeoRouteKey, RouteSeoCopy>> = {
  zh: {
    home: {
      title: 'DrawStamp Studio - 在线电子印章生成器',
      description: '免费在线生成、提取和编辑电子印章，支持圆章、椭圆章、透明 PNG、SVG 和 JPEG 导出。核心图片处理在浏览器本地完成，不上传图片。',
      keywords: '电子印章,在线印章,印章生成器,电子印章生成器,透明印章PNG,图片提取印章,公章图片制作,stamp generator,digital seal,DrawStamp Studio',
      schemaType: 'WebPage'
    },
    about: {
      title: '关于在线电子印章工作台 | DrawStamp Studio',
      description: '了解 DrawStamp Studio 的功能定位、浏览器本地处理方式、开源说明与合规的电子印章制作场景。',
      keywords: 'DrawStamp Studio,电子印章工作台,开源印章生成器,浏览器本地处理',
      schemaType: 'AboutPage'
    },
    privacy: {
      title: '隐私政策 | DrawStamp Studio',
      description: '了解 DrawStamp Studio 如何在浏览器本地处理印章图片、模板和草稿，以及 Umami 分析和 Cloudflare Pages 的使用说明。',
      keywords: 'DrawStamp Studio 隐私,本地图片处理,浏览器本地存储,印章图片隐私',
      schemaType: 'WebPage'
    },
    terms: {
      title: '服务条款 | DrawStamp Studio',
      description: '阅读 DrawStamp Studio 的合法使用范围、禁止用途、用户责任、免责声明与开源许可说明。',
      keywords: 'DrawStamp Studio 服务条款,电子印章合法使用,印章生成器免责声明',
      schemaType: 'WebPage'
    },
    contact: {
      title: '联系反馈 | DrawStamp Studio',
      description: '联系 DrawStamp Studio，提交在线印章生成器的问题反馈、功能建议、Bug 报告或开源贡献线索。',
      keywords: 'DrawStamp Studio 联系,印章生成器反馈,开源项目 Issue',
      schemaType: 'ContactPage'
    }
  },
  en: {
    home: {
      title: 'Online Stamp Maker & Seal Editor | DrawStamp Studio',
      description: 'Create, extract, edit, and export electronic stamp images online. Supports round and oval seals, transparent PNG, SVG, and JPEG. Core image processing stays in your browser.',
      keywords: 'online stamp maker,stamp generator,electronic stamp editor,digital seal maker,transparent stamp PNG,extract stamp from image,SVG stamp,DrawStamp Studio',
      schemaType: 'WebPage'
    },
    about: {
      title: 'About the Browser-Local Stamp Editor | DrawStamp Studio',
      description: 'Learn how DrawStamp Studio creates, extracts, edits, and exports electronic stamp images locally in your browser as an open-source web tool.',
      keywords: 'DrawStamp Studio,open source stamp maker,browser local image editor,electronic stamp workspace',
      schemaType: 'AboutPage'
    },
    privacy: {
      title: 'Privacy Policy | DrawStamp Studio',
      description: 'Learn how DrawStamp Studio handles stamp images, templates, drafts, local storage, Umami analytics, and Cloudflare Pages hosting.',
      keywords: 'DrawStamp Studio privacy,local image processing,browser local storage,stamp image privacy',
      schemaType: 'WebPage'
    },
    terms: {
      title: 'Terms of Service | DrawStamp Studio',
      description: 'Read the lawful-use rules, prohibited uses, user responsibilities, disclaimers, and open-source licensing terms for DrawStamp Studio.',
      keywords: 'DrawStamp Studio terms,electronic stamp lawful use,stamp maker disclaimer',
      schemaType: 'WebPage'
    },
    contact: {
      title: 'Contact & Feedback | DrawStamp Studio',
      description: 'Contact DrawStamp Studio with questions, feature requests, bug reports, collaboration ideas, or open-source contributions.',
      keywords: 'DrawStamp Studio contact,stamp maker feedback,open source issues',
      schemaType: 'ContactPage'
    }
  }
}

const homeSchemaCopy = {
  zh: {
    alternateName: '在线电子印章生成器',
    features: ['在线电子印章生成', '从图片提取透明印章', '圆章和椭圆章模板', 'PNG、SVG 和 JPEG 导出', '浏览器本地图片处理', '本地草稿与 JSON 模板导入导出'],
    faq: [
      ['DrawStamp Studio 会上传我的印章图片吗？', '不会。印章绘制、图片提取、草稿保存和导出都在浏览器端完成。'],
      ['可以导出透明背景印章吗？', '可以。选择 PNG 并关闭白底选项即可导出透明图片。'],
      ['这个工具可以用于伪造文件吗？', '不可以。本项目仅用于学习、测试、设计预览和合规授权场景。'],
      ['可以保存印章模板吗？', '可以。可导出 JSON 模板，浏览器也会保存最近的本地草稿。']
    ]
  },
  en: {
    alternateName: 'Online Stamp Maker and Electronic Seal Editor',
    features: ['Create electronic stamp images online', 'Extract transparent stamps from images', 'Round and oval stamp templates', 'PNG, SVG, and JPEG export', 'Browser-local image processing', 'Local drafts and JSON template import/export'],
    faq: [
      ['Does DrawStamp Studio upload my stamp images?', 'No. Stamp drawing, image extraction, draft storage, and export run in your browser.'],
      ['Can I export a stamp with a transparent background?', 'Yes. Choose PNG and turn off the white-background option to export a transparent image.'],
      ['Can I use this tool to forge documents?', 'No. The project is intended only for learning, testing, design previews, and legally authorized use.'],
      ['Can I save stamp templates?', 'Yes. You can export JSON templates, and the browser keeps recent local drafts.']
    ]
  }
} as const

const setMetaContent = (selector: string, content: string) => {
  document.querySelector(selector)?.setAttribute('content', content)
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

const getRouteKey = (name: unknown): SeoRouteKey => {
  return name === 'about' || name === 'privacy' || name === 'terms' || name === 'contact' ? name : 'home'
}

export const applyRouteSeo = (route: { name?: unknown; path: string }, locale: AppLocale) => {
  const routeKey = getRouteKey(route.name)
  const copy = routeSeo[locale][routeKey]
  const languageTag = locale === 'zh' ? 'zh-CN' : 'en'
  const ogLocale = locale === 'zh' ? 'zh_CN' : 'en_US'
  const alternateLocale = locale === 'zh' ? 'en_US' : 'zh_CN'
  const canonicalHref = `${SITE_URL}${route.path === '/' ? '/' : route.path}`
  const imageAlt = locale === 'zh' ? 'DrawStamp Studio 在线电子印章生成器预览' : 'DrawStamp Studio online stamp maker preview'

  document.documentElement.lang = languageTag
  document.title = copy.title
  setMetaContent('meta[http-equiv="content-language"]', languageTag)
  setMetaContent('meta[name="description"]', copy.description)
  setMetaContent('meta[name="keywords"]', copy.keywords)
  setMetaContent('meta[property="og:title"]', copy.title)
  setMetaContent('meta[property="og:description"]', copy.description)
  setMetaContent('meta[property="og:url"]', canonicalHref)
  setMetaContent('meta[property="og:locale"]', ogLocale)
  setMetaContent('meta[property="og:locale:alternate"]', alternateLocale)
  setMetaContent('meta[property="og:image"]', PREVIEW_IMAGE)
  setMetaContent('meta[property="og:image:secure_url"]', PREVIEW_IMAGE)
  setMetaContent('meta[property="og:image:alt"]', imageAlt)
  setMetaContent('meta[name="twitter:title"]', copy.title)
  setMetaContent('meta[name="twitter:description"]', copy.description)
  setMetaContent('meta[name="twitter:image"]', PREVIEW_IMAGE)
  setMetaContent('meta[name="twitter:image:alt"]', imageAlt)
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalHref)

  const homeLabel = locale === 'zh' ? '首页' : 'Home'
  const pageLabel = copy.title.replace(/ \| DrawStamp Studio$/, '').replace(/^DrawStamp Studio - /, '')
  const breadcrumbItems: object[] = [{ '@type': 'ListItem', position: 1, name: homeLabel, item: `${SITE_URL}/` }]
  if (routeKey !== 'home') {
    breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: pageLabel, item: canonicalHref })
  }

  setJsonLd('route-page-schema', {
    '@context': 'https://schema.org',
    '@type': copy.schemaType,
    name: copy.title,
    description: copy.description,
    url: canonicalHref,
    image: PREVIEW_IMAGE,
    inLanguage: languageTag,
    isPartOf: { '@type': 'WebSite', name: 'DrawStamp Studio', url: `${SITE_URL}/` },
    publisher: {
      '@type': 'Organization',
      name: 'DrawStamp Studio',
      url: `${SITE_URL}/`,
      logo: { '@type': 'ImageObject', url: LOGO_IMAGE, width: 512, height: 512 },
      sameAs: ['https://github.com/fisher0627/DrawStamp_Studio', 'https://t.me/KEVIN627ZTZ']
    },
    breadcrumb: { '@type': 'BreadcrumbList', itemListElement: breadcrumbItems }
  })

  if (routeKey !== 'home') {
    setJsonLd('software-application-schema', null)
    setJsonLd('faq-schema', null)
    return
  }

  const schemaCopy = homeSchemaCopy[locale]
  setJsonLd('software-application-schema', {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DrawStamp Studio',
    alternateName: schemaCopy.alternateName,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `${SITE_URL}/`,
    image: PREVIEW_IMAGE,
    screenshot: `${SITE_URL}/readme-workspace.png`,
    inLanguage: languageTag,
    softwareVersion: '0.6.1',
    isAccessibleForFree: true,
    description: copy.description,
    featureList: schemaCopy.features,
    publisher: { '@type': 'Organization', name: 'DrawStamp Studio', url: `${SITE_URL}/`, logo: LOGO_IMAGE },
    sameAs: ['https://github.com/fisher0627/DrawStamp_Studio', 'https://t.me/KEVIN627ZTZ'],
    license: 'https://github.com/fisher0627/DrawStamp_Studio/blob/main/LICENSE',
    offers: { '@type': 'Offer', price: '0', priceCurrency: locale === 'zh' ? 'CNY' : 'USD' }
  })

  setJsonLd('faq-schema', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: languageTag,
    mainEntity: schemaCopy.faq.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer }
    }))
  })
}
