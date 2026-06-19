<template>
  <InfoPageShell
    :title="t('about.title')"
    kicker="Project File"
    :description="t('about.whatIs.description')"
  >
    <template #aside>
      <div class="stamp-mark">
        <span>LOCAL</span>
        <strong>FIRST</strong>
      </div>
    </template>

    <section class="brief-card">
      <p class="section-label">{{ t('about.mission.title') }}</p>
      <p>{{ t('about.mission.description') }}</p>
    </section>

    <section class="feature-grid" aria-label="主要功能">
      <article>
        <span>生成</span>
        <p>{{ t('about.features.items.customDesign') }}</p>
      </article>
      <article>
        <span>模板</span>
        <p>{{ t('about.features.items.templateSystem') }}</p>
      </article>
      <article>
        <span>质感</span>
        <p>{{ t('about.features.items.advancedEffects') }}</p>
      </article>
      <article>
        <span>本地</span>
        <p>{{ t('about.features.items.localProcessing') }}</p>
      </article>
    </section>

    <section class="two-column">
      <article class="info-block">
        <p class="section-label">{{ t('about.technology.title') }}</p>
        <p>{{ t('about.technology.description') }}</p>
        <ul>
          <li>{{ t('about.technology.items.vue') }}</li>
          <li>{{ t('about.technology.items.typescript') }}</li>
          <li>{{ t('about.technology.items.canvas') }}</li>
          <li>{{ t('about.technology.items.responsive') }}</li>
        </ul>
      </article>

      <article class="info-block">
        <p class="section-label">{{ t('about.usage.title') }}</p>
        <p>{{ t('about.usage.description') }}</p>
        <ol>
          <li>{{ t('about.usage.steps.step1') }}</li>
          <li>{{ t('about.usage.steps.step2') }}</li>
          <li>{{ t('about.usage.steps.step3') }}</li>
          <li>{{ t('about.usage.steps.step4') }}</li>
        </ol>
      </article>
    </section>

    <section class="warning-panel">
      <p class="section-label">{{ t('about.warning.title') }}</p>
      <strong>{{ t('about.warning.securityWarning') }}</strong>
      <p>{{ t('about.warning.notice') }}</p>
      <ul>
        <li>{{ t('about.warning.items.item1') }}</li>
        <li>{{ t('about.warning.items.item2') }}</li>
        <li>{{ t('about.warning.items.item3') }}</li>
      </ul>
    </section>

    <section class="closing-card">
      <div>
        <p class="section-label">{{ t('about.openSource.title') }}</p>
        <p>{{ t('about.openSource.description') }}</p>
      </div>
      <RouterLink to="/contact">{{ t('about.contact.linkText') }}</RouterLink>
    </section>
  </InfoPageShell>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import InfoPageShell from './InfoPageShell.vue'

const { t } = useI18n()
</script>

<style scoped>
.stamp-mark {
  display: grid;
  place-items: center;
  width: 176px;
  height: 176px;
  margin-left: auto;
  color: var(--studio-stamp-red);
  border: 2px solid rgba(255, 0, 21, 0.7);
  border-radius: 50%;
  transform: rotate(-8deg);
}

.stamp-mark span {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.22em;
}

.stamp-mark strong {
  margin-top: -52px;
  font-size: 34px;
  letter-spacing: -0.06em;
}

.brief-card,
.info-block,
.warning-panel,
.closing-card,
.feature-grid article {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--studio-line-hair);
  border-radius: 16px;
  box-shadow: var(--studio-shadow-quiet);
}

.brief-card {
  padding: clamp(18px, 3vw, 28px);
}

.brief-card p:last-child,
.info-block p,
.warning-panel p,
.closing-card p,
.feature-grid p {
  margin: 0;
  color: var(--studio-muted);
  line-height: 1.8;
}

.section-label {
  margin: 0 0 10px !important;
  color: var(--studio-tool-blue) !important;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.feature-grid article {
  padding: 18px;
}

.feature-grid span {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 5px 10px;
  color: var(--studio-tool-blue);
  background: var(--studio-tool-blue-soft);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 900;
}

.two-column {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 14px;
}

.info-block {
  padding: 22px;
}

.info-block ul,
.warning-panel ul,
.info-block ol {
  display: grid;
  gap: 10px;
  margin: 16px 0 0;
  padding-left: 20px;
  color: var(--studio-muted);
  line-height: 1.7;
}

.warning-panel {
  margin-top: 14px;
  padding: 22px;
  background:
    linear-gradient(135deg, rgba(255, 0, 21, 0.055), rgba(255, 255, 255, 0.8)),
    #fff;
  border-color: rgba(255, 0, 21, 0.18);
}

.warning-panel strong {
  display: block;
  margin-bottom: 8px;
  color: var(--studio-stamp-red);
}

.closing-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 14px;
  padding: 22px;
}

.closing-card a {
  flex: 0 0 auto;
  padding: 10px 16px;
  color: #fff;
  background: var(--studio-tool-blue);
  border-radius: 999px;
  font-weight: 900;
  text-decoration: none;
}

@media (max-width: 900px) {
  .feature-grid,
  .two-column {
    grid-template-columns: 1fr;
  }

  .stamp-mark {
    width: 132px;
    height: 132px;
    margin: 0;
  }

  .stamp-mark strong {
    margin-top: -40px;
    font-size: 26px;
  }
}

@media (max-width: 640px) {
  .closing-card {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
