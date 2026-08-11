<template>
  <section class="seo-content" aria-labelledby="seo-title">
    <div class="seo-hero">
      <div class="seo-brand-lockup">
        <img src="/logo-mark.svg" alt="DrawStamp Studio" width="52" height="52" loading="lazy" />
        <div>
          <strong>DrawStamp Studio</strong>
          <span>Browser-local electronic stamp workspace</span>
        </div>
      </div>
      <p class="seo-eyebrow">Browser Local Stamp Editor</p>
      <h2 id="seo-title">{{ t('studio.seoContent.title') }}</h2>
      <p>{{ t('studio.seoContent.intro') }}</p>
      <div class="seo-meta" :aria-label="t('studio.seoContent.featuresAria')">
        <span>{{ t('studio.seoContent.features.local') }}</span>
        <span>{{ t('studio.seoContent.features.transparent') }}</span>
        <span>{{ t('studio.seoContent.features.formats') }}</span>
        <span>{{ t('studio.seoContent.features.drafts') }}</span>
      </div>
    </div>

    <div class="seo-grid">
      <article>
        <span>01</span>
        <h3>{{ t('studio.seoContent.cards.createTitle') }}</h3>
        <p>{{ t('studio.seoContent.cards.createText') }}</p>
      </article>
      <article>
        <span>02</span>
        <h3>{{ t('studio.seoContent.cards.extractTitle') }}</h3>
        <p>{{ t('studio.seoContent.cards.extractText') }}</p>
      </article>
      <article>
        <span>03</span>
        <h3>{{ t('studio.seoContent.cards.exportTitle') }}</h3>
        <p>{{ t('studio.seoContent.cards.exportText') }}</p>
      </article>
    </div>

    <section class="seo-guides" :aria-label="t('studio.seoContent.guidesAria')">
      <div>
        <p class="seo-eyebrow">{{ t('studio.seoContent.guidesEyebrow') }}</p>
        <h2>{{ t('studio.seoContent.guidesTitle') }}</h2>
      </div>
      <RouterLink v-for="guide in guides" :key="guide.key" :to="routePath(guide.path)">
        <span>{{ guide.index }}</span>
        <strong>{{ guide.heading }}</strong>
      </RouterLink>
    </section>

    <div class="seo-faq" :aria-label="t('studio.seoContent.faqAria')">
      <h2>{{ t('studio.seoContent.faqTitle') }}</h2>
      <details open>
        <summary>{{ t('studio.seoContent.faq.uploadQ') }}</summary>
        <p>{{ t('studio.seoContent.faq.uploadA') }}</p>
      </details>
      <details>
        <summary>{{ t('studio.seoContent.faq.transparentQ') }}</summary>
        <p>{{ t('studio.seoContent.faq.transparentA') }}</p>
      </details>
      <details>
        <summary>{{ t('studio.seoContent.faq.safetyQ') }}</summary>
        <p>{{ t('studio.seoContent.faq.safetyA') }}</p>
      </details>
      <details>
        <summary>{{ t('studio.seoContent.faq.saveQ') }}</summary>
        <p>{{ t('studio.seoContent.faq.saveA') }}</p>
      </details>
    </div>

    <aside class="seo-evidence">
      <p class="seo-eyebrow">{{ evidence.label }}</p>
      <p>{{ evidence.text }}</p>
      <time :datetime="homeLastmod">{{ evidence.updated }}{{ homeLastmod }}</time>
    </aside>

    <nav class="seo-links" :aria-label="t('studio.nav.aria')">
      <RouterLink :to="routePath('/about')">{{ t('studio.nav.about') }}</RouterLink>
      <RouterLink :to="routePath('/privacy')">{{ t('studio.nav.privacy') }}</RouterLink>
      <RouterLink :to="routePath('/terms')">{{ t('studio.nav.terms') }}</RouterLink>
      <RouterLink :to="routePath('/contact')">{{ t('studio.nav.contact') }}</RouterLink>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { localizedPath } from '../../localizedRoutes'
import seoPages from '../../seo-pages.json'

const { t, locale } = useI18n()
const routePath = (path: string) => localizedPath(path, locale.value === 'zh' ? 'zh' : 'en')
const guideKeys = ['extractTransparentStamp', 'roundSealTemplate', 'svgStampExport'] as const
const guides = computed(() => guideKeys.map((key, index) => ({
  key,
  index: `0${index + 1}`,
  ...seoPages.routes[key][locale.value === 'zh' ? 'zh' : 'en']
})))
const homeLastmod = seoPages.routes.home.lastmod || seoPages.lastmod
const evidence = computed(() => locale.value === 'zh'
  ? {
      label: '内容依据与使用边界',
      text: '功能说明来源于 DrawStamp Studio 当前公开的浏览器端功能。印章编辑、图片提取和导出仅用于学习、测试、设计预览及其他合法授权场景。',
      updated: '最后更新：'
    }
  : {
      label: 'Content basis and use boundary',
      text: 'Feature descriptions are based on DrawStamp Studio’s currently public browser workflow. Stamp editing, image extraction, and export are for learning, testing, design previews, and other lawful authorized uses.',
      updated: 'Last updated: '
    })
</script>

<style scoped>
.seo-content {
  position: relative;
  isolation: isolate;
  width: 100%;
  margin: 18px 0 4px;
  padding: clamp(18px, 3vw, 34px);
  box-sizing: border-box;
  text-align: left;
  background:
    radial-gradient(circle at 8% 12%, rgba(255, 255, 255, 0.88), transparent 28%),
    linear-gradient(135deg, rgba(35, 76, 92, 0.055) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #fffefa 0%, #f5f6f0 100%);
  background-size: auto, 20px 20px, auto;
  border: 1px solid var(--studio-line);
  border-radius: 14px;
  box-shadow: var(--studio-shadow-panel);
  overflow: hidden;
}

.seo-content::after {
  content: '';
  position: absolute;
  top: 22px;
  right: 24px;
  z-index: -1;
  width: clamp(76px, 11vw, 132px);
  height: clamp(76px, 11vw, 132px);
  border: 2px solid rgba(255, 0, 21, 0.12);
  border-radius: 50%;
}

.seo-hero {
  max-width: 780px;
}

.seo-brand-lockup {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.seo-brand-lockup img {
  display: block;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  filter: drop-shadow(0 6px 12px rgba(111, 18, 24, 0.14));
}

.seo-brand-lockup strong,
.seo-brand-lockup span {
  display: block;
}

.seo-brand-lockup strong {
  color: var(--studio-ink);
  font-size: 16px;
  line-height: 1.25;
}

.seo-brand-lockup span {
  color: var(--studio-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.seo-eyebrow {
  color: var(--studio-ui-red);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 0 0 8px;
}

.seo-content h2,
.seo-content h3,
.seo-content p {
  margin: 0;
}

.seo-content h2 {
  color: var(--studio-ink);
  font-size: clamp(22px, 3.4vw, 32px);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.seo-content p {
  color: var(--studio-muted);
  font-size: 14px;
  line-height: 1.7;
  margin-top: 10px;
}

.seo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.seo-meta span {
  padding: 5px 11px;
  border: 1px solid var(--studio-line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--studio-ink);
  font-size: 12px;
}

.seo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin-top: 22px;
}

.seo-grid article,
.seo-faq {
  border: 1px solid var(--studio-line);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
  padding: 18px;
}

.seo-grid article {
  text-align: left;
}

.seo-grid span {
  color: var(--studio-ui-red);
  font-size: 12px;
  font-weight: 700;
}

.seo-grid h3 {
  color: var(--studio-ink);
  font-size: 15px;
  margin-top: 8px;
}

.seo-grid p {
  margin-top: 6px;
  font-size: 13px;
}

.seo-guides {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) repeat(3, minmax(150px, 1fr));
  gap: 12px;
  align-items: stretch;
  margin-top: 14px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid var(--studio-line);
  border-radius: 12px;
}

.seo-guides .seo-eyebrow {
  margin-bottom: 6px;
}

.seo-guides h2 {
  font-size: 18px;
}

.seo-guides a {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 12px;
  color: var(--studio-ink);
  background: var(--studio-soft);
  border: 1px solid var(--studio-line-hair);
  border-radius: 10px;
  text-decoration: none;
}

.seo-guides a:hover {
  color: var(--studio-tool-blue);
  border-color: rgba(35, 76, 92, 0.3);
}

.seo-guides a span {
  color: var(--studio-ui-red);
  font-size: 11px;
  font-weight: 900;
}

.seo-guides a strong {
  font-size: 13px;
  line-height: 1.45;
}

.seo-faq {
  margin-top: 14px;
}

.seo-faq h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

.seo-faq details {
  border-top: 1px solid var(--studio-line-hair);
  padding: 10px 2px;
}

.seo-faq details:first-of-type {
  border-top: 0;
}

.seo-faq details:last-of-type {
  padding-bottom: 0;
}

.seo-evidence {
  margin-top: 14px;
  padding: 16px 18px;
  border: 1px solid var(--studio-line);
  border-left: 3px solid var(--studio-tool-blue);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.72);
}

.seo-evidence p {
  margin-top: 0;
}

.seo-evidence time {
  display: block;
  margin-top: 10px;
  color: var(--studio-muted);
  font-size: 12px;
}

.seo-faq summary {
  color: var(--studio-ink);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.seo-faq details p {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.seo-links {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 20px;
}

.seo-links a {
  color: var(--studio-tool-blue);
  font-size: 13px;
  text-decoration: none;
}

.seo-links a:hover {
  text-decoration: underline;
}
</style>
