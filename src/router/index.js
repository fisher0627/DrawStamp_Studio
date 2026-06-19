import { createRouter, createWebHistory } from 'vue-router'
import StampWorkspace from '../components/editor/StampWorkspace.vue'
import AboutUs from '../components/AboutUs.vue'
import ContactUs from '../components/ContactUs.vue'
import PrivacyPolicy from '../components/PrivacyPolicy.vue'
import TermsOfService from '../components/TermsOfService.vue'

const siteUrl = 'https://wosp.cc.cd'

const routes = [
  {
    path: '/',
    name: 'home',
    component: StampWorkspace,
    meta: {
      title: 'DrawStamp Studio - 在线电子印章工作台',
      description: 'DrawStamp Studio 是一个在线电子印章工作台，支持圆章、椭圆章、图片提取印章、画布编辑、模板管理、透明 PNG、SVG 和 JPEG 导出。图片处理在浏览器本地完成，不上传服务器。'
    }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutUs,
    meta: {
      title: '关于 DrawStamp Studio - 在线电子印章生成器',
      description: '了解 DrawStamp Studio 的功能定位、浏览器本地处理方式、开源说明和电子印章制作使用场景。'
    }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: PrivacyPolicy,
    meta: {
      title: '隐私政策 - DrawStamp Studio',
      description: 'DrawStamp Studio 隐私政策，说明浏览器本地处理、草稿存储、访问分析和用户数据保护方式。'
    }
  },
  {
    path: '/terms',
    name: 'terms',
    component: TermsOfService,
    meta: {
      title: '服务条款 - DrawStamp Studio',
      description: 'DrawStamp Studio 服务条款，说明在线电子印章工具的合法使用范围、免责声明和用户责任。'
    }
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactUs,
    meta: {
      title: '联系与反馈 - DrawStamp Studio',
      description: '联系 DrawStamp Studio，提交电子印章生成器的问题反馈、功能建议、Bug 报告或开源贡献线索。'
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

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : routes[0].meta.title
  const description = typeof to.meta.description === 'string' ? to.meta.description : routes[0].meta.description
  const canonicalHref = `${siteUrl}${to.path === '/' ? '/' : to.path}`

  document.title = title

  const descriptionMeta = document.querySelector('meta[name="description"]')
  if (descriptionMeta) {
    descriptionMeta.setAttribute('content', description)
  }

  const canonical = document.querySelector('link[rel="canonical"]')
  if (canonical) {
    canonical.setAttribute('href', canonicalHref)
  }

  const ogUrl = document.querySelector('meta[property="og:url"]')
  if (ogUrl) {
    ogUrl.setAttribute('content', canonicalHref)
  }
})

export default router
