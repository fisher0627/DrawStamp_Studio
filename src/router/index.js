import { createRouter, createWebHistory } from 'vue-router'
import StampWorkspace from '../components/editor/StampWorkspace.vue'
import AboutUs from '../components/AboutUs.vue'
import ContactUs from '../components/ContactUs.vue'
import PrivacyPolicy from '../components/PrivacyPolicy.vue'
import TermsOfService from '../components/TermsOfService.vue'

const siteUrl = 'https://wosp.cc.cd'
const previewImage = `${siteUrl}/social-preview.png`
const logoImage = `${siteUrl}/icon-512.png`

const routes = [
  {
    path: '/',
    name: 'home',
    component: StampWorkspace,
    meta: {
      title: 'DrawStamp Studio - 在线电子印章工作台',
      description: 'DrawStamp Studio 是一个在线电子印章工作台，支持圆章、椭圆章、图片提取印章、画布编辑、模板管理、透明 PNG、SVG 和 JPEG 导出。图片处理在浏览器本地完成，不上传服务器。',
      schemaType: 'WebPage'
    }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutUs,
    meta: {
      title: '关于 DrawStamp Studio - 在线电子印章生成器',
      description: '了解 DrawStamp Studio 的功能定位、浏览器本地处理方式、开源说明和电子印章制作使用场景。',
      schemaType: 'AboutPage'
    }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: PrivacyPolicy,
    meta: {
      title: '隐私政策 - DrawStamp Studio',
      description: 'DrawStamp Studio 隐私政策，说明浏览器本地处理、草稿存储、访问分析和用户数据保护方式。',
      schemaType: 'WebPage'
    }
  },
  {
    path: '/terms',
    name: 'terms',
    component: TermsOfService,
    meta: {
      title: '服务条款 - DrawStamp Studio',
      description: 'DrawStamp Studio 服务条款，说明在线电子印章工具的合法使用范围、免责声明和用户责任。',
      schemaType: 'WebPage'
    }
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactUs,
    meta: {
      title: '联系与反馈 - DrawStamp Studio',
      description: '联系 DrawStamp Studio，提交电子印章生成器的问题反馈、功能建议、Bug 报告或开源贡献线索。',
      schemaType: 'ContactPage'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

const setMetaContent = (selector, content) => {
  const meta = document.querySelector(selector)
  if (meta && typeof content === 'string') {
    meta.setAttribute('content', content)
  }
}

const setPageSchema = (to, title, description, canonicalHref) => {
  const schemaId = 'route-page-schema'
  let schema = document.getElementById(schemaId)

  if (!schema) {
    schema = document.createElement('script')
    schema.id = schemaId
    schema.type = 'application/ld+json'
    document.head.appendChild(schema)
  }

  const schemaType = typeof to.meta.schemaType === 'string' ? to.meta.schemaType : 'WebPage'
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: '首页',
      item: `${siteUrl}/`
    }
  ]

  if (to.path !== '/') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: title.replace(' - DrawStamp Studio', ''),
      item: canonicalHref
    })
  }

  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: title,
    description,
    url: canonicalHref,
    image: previewImage,
    inLanguage: 'zh-CN',
    isPartOf: {
      '@type': 'WebSite',
      name: 'DrawStamp Studio',
      url: siteUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'DrawStamp Studio',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: logoImage,
        width: 512,
        height: 512
      },
      sameAs: [
        'https://github.com/fisher0627/DrawStamp_Studio',
        'https://t.me/KEVIN627ZTZ'
      ]
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems
    }
  }

  schema.textContent = JSON.stringify(pageSchema)
}

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : routes[0].meta.title
  const description = typeof to.meta.description === 'string' ? to.meta.description : routes[0].meta.description
  const canonicalHref = `${siteUrl}${to.path === '/' ? '/' : to.path}`

  document.title = title

  setMetaContent('meta[name="description"]', description)
  setMetaContent('meta[property="og:title"]', title)
  setMetaContent('meta[property="og:description"]', description)
  setMetaContent('meta[property="og:url"]', canonicalHref)
  setMetaContent('meta[property="og:image"]', previewImage)
  setMetaContent('meta[property="og:image:secure_url"]', previewImage)
  setMetaContent('meta[name="twitter:title"]', title)
  setMetaContent('meta[name="twitter:description"]', description)
  setMetaContent('meta[name="twitter:image"]', previewImage)

  const canonical = document.querySelector('link[rel="canonical"]')
  if (canonical) {
    canonical.setAttribute('href', canonicalHref)
  }

  setPageSchema(to, title, description, canonicalHref)
})

export default router
