<template>
  <div class="language-switcher" role="group" :aria-label="t('studio.language.switcher')">
    <span class="language-icon" aria-hidden="true">A/文</span>
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="{ active: locale === option.value }"
      :aria-pressed="locale === option.value"
      @click="setAppLocale(option.value)"
    >
      {{ option.shortLabel }}
      <span class="sr-only">{{ t(option.labelKey) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { setAppLocale, type AppLocale } from '../i18n'

const { locale, t } = useI18n({ useScope: 'global' })

const options: Array<{ value: AppLocale; shortLabel: string; labelKey: string }> = [
  { value: 'zh', shortLabel: '中', labelKey: 'studio.language.zh' },
  { value: 'en', shortLabel: 'EN', labelKey: 'studio.language.en' }
]
</script>

<style scoped>
.language-switcher {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-height: 36px;
  padding: 3px;
  color: var(--studio-muted);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--studio-line-hair);
  border-radius: 999px;
  box-shadow: 0 1px 2px rgba(31, 42, 36, 0.06);
}

.language-icon {
  padding: 0 5px 0 7px;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

button {
  display: grid;
  place-items: center;
  min-width: 30px;
  min-height: 28px;
  padding: 0 8px;
  color: var(--studio-muted);
  background: transparent;
  border: 0;
  border-radius: 999px;
  font: inherit;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

button:hover {
  color: var(--studio-ink);
  background: var(--studio-soft);
}

button.active {
  color: #fff;
  background: var(--studio-tool-blue);
  box-shadow: 0 2px 6px rgba(35, 76, 92, 0.2);
}

button:focus-visible {
  outline: 2px solid var(--studio-focus);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
