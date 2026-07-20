<template>
  <InfoPageShell
    :title="content.title"
    :kicker="content.kicker"
    :description="content.description"
    tone="legal"
  >
    <template #aside>
      <div class="document-meta">
        <span>{{ content.lastUpdatedLabel }}</span>
        <strong>{{ content.lastUpdated }}</strong>
      </div>
    </template>

    <section class="policy-summary">
      <article v-for="item in content.aside" :key="item.label">
        <span>{{ item.label }}</span>
        <p>{{ item.text }}</p>
      </article>
    </section>

    <section class="document-list">
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
const content = computed(() => legalContent[locale.value === 'zh' ? 'zh' : 'en'].privacy)
</script>

<style scoped>
.document-meta,
.policy-summary article,
.document-list article {
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid var(--studio-line-hair);
  border-radius: 16px;
  box-shadow: var(--studio-shadow-quiet);
}

.document-meta {
  display: grid;
  gap: 8px;
  padding: 18px;
}

.document-meta span,
.policy-summary span {
  color: var(--studio-muted);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.document-meta strong {
  color: var(--studio-ink);
  font-size: 22px;
}

.policy-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.policy-summary article {
  padding: 18px;
}

.policy-summary p,
.document-list p,
.document-list li {
  color: var(--studio-muted);
  line-height: 1.8;
}

.policy-summary p {
  margin: 10px 0 0;
}

.document-list {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.document-list article {
  padding: 22px;
}

.document-list h2 {
  margin: 0 0 10px;
  color: var(--studio-ink);
  font-size: 20px;
}

.document-list p {
  margin: 0;
}

.document-list ul {
  display: grid;
  gap: 10px;
  margin: 12px 0 0;
  padding-left: 20px;
}

.document-list a {
  color: var(--studio-tool-blue);
  font-weight: 900;
  text-decoration: none;
}

@media (max-width: 800px) {
  .policy-summary {
    grid-template-columns: 1fr;
  }
}
</style>
