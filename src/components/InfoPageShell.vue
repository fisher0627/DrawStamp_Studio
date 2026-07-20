<template>
  <main class="info-page-shell" :class="toneClass">
    <aside class="info-page-rail" :aria-label="t('studio.nav.aria')">
      <RouterLink to="/" class="rail-home">
        <img src="/logo-lockup.svg" :alt="t('studio.nav.homeAlt')" width="178" height="46" />
        <span>{{ t('studio.nav.dossier') }}</span>
      </RouterLink>
      <nav>
        <RouterLink to="/about">{{ t('studio.nav.about') }}</RouterLink>
        <RouterLink to="/privacy">{{ t('studio.nav.privacy') }}</RouterLink>
        <RouterLink to="/terms">{{ t('studio.nav.terms') }}</RouterLink>
        <RouterLink to="/contact">{{ t('studio.nav.contact') }}</RouterLink>
      </nav>
      <LanguageSwitcher />
    </aside>

    <section class="info-page-document">
      <header class="info-page-hero">
        <div>
          <p class="info-page-kicker">{{ kicker }}</p>
          <h1>{{ title }}</h1>
          <p class="info-page-lede">{{ description }}</p>
        </div>
        <div v-if="$slots.aside" class="info-page-hero-aside">
          <slot name="aside" />
        </div>
      </header>

      <div class="info-page-body">
        <slot />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from './LanguageSwitcher.vue'

const { t } = useI18n()

const props = defineProps<{
  title: string
  kicker: string
  description: string
  tone?: 'default' | 'legal' | 'contact'
}>()

const toneClass = computed(() => `tone-${props.tone || 'default'}`)
</script>

<style scoped>
.info-page-shell {
  --page-accent: var(--studio-tool-blue);
  --page-accent-soft: var(--studio-tool-blue-soft);
  display: grid;
  grid-template-columns: 196px minmax(0, 1fr);
  gap: 18px;
  width: 100%;
  min-height: calc(100vh - 36px);
  text-align: left;
}

.info-page-shell.tone-legal {
  --page-accent: #4f5b4f;
  --page-accent-soft: #eef2ea;
}

.info-page-shell.tone-contact {
  --page-accent: #2e6f8f;
  --page-accent-soft: #e8f2f5;
}

.info-page-rail {
  position: sticky;
  top: 18px;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: calc(100vh - 36px);
  padding: 16px;
  box-sizing: border-box;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(244, 245, 241, 0.84)),
    var(--studio-panel);
  border: 1px solid var(--studio-line);
  border-radius: 16px;
  box-shadow: var(--studio-shadow-quiet);
}

.rail-home {
  display: grid;
  gap: 8px;
  padding: 12px;
  color: var(--studio-ink);
  background: #fff;
  border: 1px solid var(--studio-line-hair);
  border-radius: 12px;
  text-decoration: none;
}

.rail-home img {
  display: block;
  width: 100%;
  max-width: 178px;
  height: auto;
}

.rail-home span {
  color: var(--studio-muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.info-page-rail nav {
  display: grid;
  gap: 8px;
}

.info-page-rail :deep(.language-switcher) {
  align-self: flex-start;
}

.info-page-rail nav a {
  padding: 10px 12px;
  color: var(--studio-muted);
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
}

.info-page-rail nav a:hover,
.info-page-rail nav a.router-link-active {
  color: var(--page-accent);
  background: var(--page-accent-soft);
  border-color: rgba(35, 76, 92, 0.12);
}

.info-page-document {
  min-width: 0;
  background:
    radial-gradient(circle at 12% 0%, rgba(255, 255, 255, 0.95), transparent 32%),
    linear-gradient(135deg, rgba(35, 76, 92, 0.045) 0 1px, transparent 1px 100%),
    var(--studio-panel);
  background-size: auto, 24px 24px, auto;
  border: 1px solid var(--studio-line);
  border-radius: 18px;
  box-shadow: var(--studio-shadow-panel);
  overflow: hidden;
}

.info-page-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 320px);
  gap: 24px;
  align-items: end;
  padding: clamp(24px, 4vw, 48px);
  border-bottom: 1px solid var(--studio-line);
}

.info-page-hero::before {
  content: '';
  position: absolute;
  inset: 18px auto auto 18px;
  width: 72px;
  height: 72px;
  border: 2px solid rgba(255, 0, 21, 0.16);
  border-radius: 50%;
}

.info-page-kicker {
  margin: 0 0 12px;
  color: var(--page-accent);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.info-page-hero h1 {
  max-width: 860px;
  margin: 0;
  color: var(--studio-ink);
  font-size: clamp(34px, 5.8vw, 76px);
  line-height: 0.96;
  letter-spacing: -0.07em;
}

.info-page-lede {
  max-width: 760px;
  margin: 18px 0 0;
  color: var(--studio-muted);
  font-size: clamp(16px, 1.6vw, 19px);
  line-height: 1.8;
}

.info-page-hero-aside {
  justify-self: end;
  width: 100%;
}

.info-page-body {
  padding: clamp(20px, 3vw, 38px);
}

@media (max-width: 960px) {
  .info-page-shell {
    grid-template-columns: 1fr;
  }

  .info-page-rail {
    position: static;
    min-height: auto;
  }

  .info-page-rail nav {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .rail-home {
    display: none;
  }

  .info-page-hero {
    grid-template-columns: 1fr;
  }

  .info-page-hero-aside {
    justify-self: stretch;
  }
}

@media (max-width: 640px) {
  .info-page-shell {
    min-height: auto;
  }

  .info-page-rail {
    padding: 10px;
    overflow: hidden;
  }

  .info-page-rail nav {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
  }

  .info-page-rail nav a {
    flex: 0 0 auto;
    min-width: 96px;
    text-align: center;
    white-space: nowrap;
    scroll-snap-align: start;
  }

  .info-page-hero {
    padding: 24px 18px;
  }

  .info-page-body {
    padding: 18px;
  }
}
</style>
