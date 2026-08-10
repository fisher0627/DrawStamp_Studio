import { createRouter, createWebHistory } from 'vue-router'
import i18n from '../i18n'
import { setAppLocale } from '../i18n'
import { localeFromPath } from '../localizedRoutes'
import { applyRouteSeo } from '../seo'

const routeDefinitions = [
  { key: 'home', path: '/', component: () => import('../components/editor/StampWorkspace.vue') },
  { key: 'about', path: '/about', component: () => import('../components/AboutUs.vue') },
  { key: 'privacy', path: '/privacy', component: () => import('../components/PrivacyPolicy.vue') },
  { key: 'terms', path: '/terms', component: () => import('../components/TermsOfService.vue') },
  { key: 'contact', path: '/contact', component: () => import('../components/ContactUs.vue') }
]

const localizedRoutes = (locale) => routeDefinitions.map(({ key, path, component }) => ({
  path: locale === 'en' ? (path === '/' ? '/en/' : `/en${path}`) : path,
  name: `${key}-${locale}`,
  component,
  meta: { locale, seoKey: key }
}))

const routes = [...localizedRoutes('zh'), ...localizedRoutes('en')]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const routeLocale = localeFromPath(to.path)
  if (i18n.global.locale.value !== routeLocale) setAppLocale(routeLocale)
})

router.afterEach((to) => {
  applyRouteSeo(to, localeFromPath(to.path))
})

export default router
