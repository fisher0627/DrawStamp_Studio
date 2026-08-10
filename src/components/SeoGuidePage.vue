<template>
  <InfoPageShell
    v-if="page"
    :title="page.heading"
    :kicker="page.eyebrow"
    :description="page.summary"
  >
    <template #aside>
      <div class="guide-aside">
        <span>{{ locale === 'zh' ? '浏览器本地操作' : 'BROWSER-LOCAL' }}</span>
        <strong>{{ locale === 'zh' ? '实时预览' : 'LIVE PREVIEW' }}</strong>
      </div>
    </template>

    <section v-for="section in page.sections" :key="section.title" class="guide-section">
      <p class="section-label">{{ section.title }}</p>
      <template v-if="section.paragraphs">
        <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
      </template>
      <ol v-if="section.steps">
        <li v-for="step in section.steps" :key="step">{{ step }}</li>
      </ol>
    </section>

    <section class="guide-cta">
      <div>
        <p class="section-label">{{ locale === 'zh' ? '开始操作' : 'START IN THE EDITOR' }}</p>
        <p>{{ page.ctaDescription }}</p>
      </div>
      <RouterLink :to="routePath('/')">{{ page.ctaLabel }}</RouterLink>
    </section>

    <nav class="related-guides" :aria-label="locale === 'zh' ? '相关指南' : 'Related guides'">
      <p class="section-label">{{ locale === 'zh' ? '相关指南' : 'RELATED GUIDES' }}</p>
      <div>
        <RouterLink v-for="guide in relatedGuides" :key="guide.key" :to="routePath(guide.path)">
          {{ guide.heading }}
        </RouterLink>
      </div>
    </nav>
  </InfoPageShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import InfoPageShell from './InfoPageShell.vue'
import seoPages from '../seo-pages.json'
import { localizedPath } from '../localizedRoutes'

const guideKeys = ['extractTransparentStamp', 'roundSealTemplate', 'svgStampExport'] as const
const route = useRoute()
const { locale } = useI18n()
const activeLocale = computed(() => locale.value === 'zh' ? 'zh' : 'en')
const guideKey = computed(() => String(route.meta.seoKey || ''))
const page = computed(() => (seoPages.routes as Record<string, any>)[guideKey.value]?.[activeLocale.value])
const relatedGuides = computed(() => guideKeys
  .filter((key) => key !== guideKey.value)
  .map((key) => ({ key, ...(seoPages.routes as Record<string, any>)[key][activeLocale.value] })))
const routePath = (path: string) => localizedPath(path, activeLocale.value)
</script>

<style scoped>
.guide-aside {
  display: grid;
  place-items: center;
  width: min(176px, 100%);
  aspect-ratio: 1;
  margin-left: auto;
  color: var(--studio-stamp-red);
  border: 2px solid rgba(255, 0, 21, 0.68);
  border-radius: 50%;
  transform: rotate(-7deg);
}

.guide-aside span {
  margin-top: 32px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.guide-aside strong {
  margin-top: -48px;
  font-size: 24px;
  letter-spacing: -0.06em;
}

.guide-section,
.guide-cta,
.related-guides {
  padding: clamp(18px, 3vw, 26px);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--studio-line-hair);
  border-radius: 16px;
  box-shadow: var(--studio-shadow-quiet);
}

.guide-section + .guide-section,
.guide-cta,
.related-guides {
  margin-top: 14px;
}

.section-label {
  margin: 0 0 10px !important;
  color: var(--studio-tool-blue) !important;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.guide-section p:not(.section-label),
.guide-cta p:not(.section-label) {
  margin: 0;
  color: var(--studio-muted);
  line-height: 1.8;
}

.guide-section p:not(.section-label) + p:not(.section-label) {
  margin-top: 10px;
}

.guide-section ol {
  display: grid;
  gap: 11px;
  margin: 18px 0 0;
  padding-left: 22px;
  color: var(--studio-muted);
  line-height: 1.75;
}

.guide-section li::marker {
  color: var(--studio-stamp-red);
  font-weight: 900;
}

.guide-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  background: linear-gradient(135deg, rgba(35, 76, 92, 0.07), rgba(255, 255, 255, 0.9));
}

.guide-cta a {
  flex: 0 0 auto;
  padding: 11px 16px;
  color: #fff;
  background: var(--studio-tool-blue);
  border-radius: 999px;
  font-weight: 900;
  text-decoration: none;
}

.guide-cta a:hover {
  background: #173f4e;
}

.related-guides > div {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.related-guides a {
  min-width: 0;
  padding: 13px 14px;
  color: var(--studio-ink);
  background: var(--studio-soft);
  border: 1px solid var(--studio-line-hair);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.45;
  text-decoration: none;
}

.related-guides a:hover {
  color: var(--studio-tool-blue);
  border-color: rgba(35, 76, 92, 0.3);
}

@media (max-width: 800px) {
  .guide-aside {
    width: 128px;
    margin: 0;
  }

  .guide-aside strong {
    font-size: 18px;
  }
}

@media (max-width: 640px) {
  .guide-cta {
    align-items: flex-start;
    flex-direction: column;
  }

  .related-guides > div {
    grid-template-columns: 1fr;
  }
}
</style>
