import { createRouter, createWebHistory } from 'vue-router'
import StampWorkspace from '../components/editor/StampWorkspace.vue'
import AboutUs from '../components/AboutUs.vue'
import ContactUs from '../components/ContactUs.vue'
import PrivacyPolicy from '../components/PrivacyPolicy.vue'
import TermsOfService from '../components/TermsOfService.vue'
import i18n from '../i18n'
import { applyRouteSeo } from '../seo'

const routes = [
  {
    path: '/',
    name: 'home',
    component: StampWorkspace
  },
  {
    path: '/about',
    name: 'about',
    component: AboutUs
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: PrivacyPolicy
  },
  {
    path: '/terms',
    name: 'terms',
    component: TermsOfService
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactUs
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
  applyRouteSeo(to, i18n.global.locale.value)
})

export default router
