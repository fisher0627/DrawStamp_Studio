import { createApp, watch } from 'vue'
import App from './App.vue'
import './style.css'
import i18n from './i18n'
import router from './router'
import { applyRouteSeo } from './seo'
import type { AppLocale } from './i18n'

const app = createApp(App)
app.use(i18n)
app.use(router)

watch(
  () => i18n.global.locale.value,
  (locale) => applyRouteSeo(router.currentRoute.value, locale as AppLocale)
)

app.mount('#app')
