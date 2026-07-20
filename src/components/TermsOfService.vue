<template>
  <InfoPageShell
    :title="content.title"
    :kicker="content.kicker"
    :description="content.description"
    tone="legal"
  >
    <template #aside>
      <div class="terms-aside">
        <span>{{ content.lastUpdatedLabel }}</span>
        <strong>{{ content.lastUpdated }}</strong>
        <p>{{ content.aside[0].text }}</p>
      </div>
    </template>

    <section class="terms-warning">
      <strong>{{ content.highlightTitle }}</strong>
      <p>{{ content.highlightText }}</p>
    </section>

    <section class="terms-list">
      <article v-for="section in content.sections" :key="section.title">
        <h2>{{ section.title }}</h2>
        <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
        <ul v-if="section.items">
          <li v-for="item in section.items" :key="item">{{ item }}</li>
        </ul>
        <p v-if="section.contact">
          {{ content.contactPrefix }}
          <RouterLink to="/contact">{{ content.contactLink }}</RouterLink>
          {{ content.contactSuffix }}
        </p>
      </article>
    </section>
  </InfoPageShell>
</template>

<script setup lang="ts">
import InfoPageShell from './InfoPageShell.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { legalContent } from '../i18n/legalContent'

const { locale } = useI18n()
const content = computed(() => legalContent[locale.value === 'zh' ? 'zh' : 'en'].terms)
</script>

<style scoped>
.terms-aside,
.terms-warning,
.terms-list article {
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid var(--studio-line-hair);
  border-radius: 16px;
  box-shadow: var(--studio-shadow-quiet);
}

.terms-aside {
  display: grid;
  gap: 8px;
  padding: 18px;
}

.terms-aside span {
  color: var(--studio-muted);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.terms-aside strong {
  color: var(--studio-ink);
  font-size: 22px;
}

.terms-aside p {
  margin: 0;
  color: var(--studio-muted);
  line-height: 1.7;
}

.terms-warning {
  padding: 22px;
  background:
    linear-gradient(135deg, rgba(255, 0, 21, 0.06), rgba(255, 255, 255, 0.82)),
    #fff;
  border-color: rgba(255, 0, 21, 0.18);
}

.terms-warning strong {
  display: block;
  margin-bottom: 8px;
  color: var(--studio-stamp-red);
}

.terms-warning p,
.terms-list p,
.terms-list li {
  color: var(--studio-muted);
  line-height: 1.8;
}

.terms-warning p,
.terms-list p {
  margin: 0;
}

.terms-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.terms-list article {
  padding: 22px;
}

.terms-list h2 {
  margin: 0 0 10px;
  color: var(--studio-ink);
  font-size: 20px;
}

.terms-list ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 20px;
}

.terms-list a {
  color: var(--studio-tool-blue);
  font-weight: 900;
  text-decoration: none;
}

@media (max-width: 820px) {
  .terms-list {
    grid-template-columns: 1fr;
  }
}
</style>
