<template>
  <InfoPageShell
    :title="t('contact.title')"
    kicker="Contact Desk"
    :description="t('contact.intro')"
    tone="contact"
  >
    <template #aside>
      <div class="contact-aside">
        <img src="/telegram-qr.png" alt="Telegram 联系二维码 @KEVIN627ZTZ" loading="lazy" />
        <strong>@KEVIN627ZTZ</strong>
        <a target="_blank" rel="noopener noreferrer" :href="telegramUrl">打开 Telegram</a>
      </div>
    </template>

    <section class="contact-primary">
      <article class="contact-card telegram-card">
        <p class="section-label">{{ t('contact.methods.telegram.title') }}</p>
        <h2>首选联系入口</h2>
        <p>{{ t('contact.methods.telegram.description') }}</p>
        <a class="primary-action" target="_blank" rel="noopener noreferrer" :href="telegramUrl">
          {{ t('contact.methods.telegram.joinGroup') }}
        </a>
      </article>

      <article class="contact-card">
        <p class="section-label">{{ t('contact.methods.email.title') }}</p>
        <h2>邮件草稿</h2>
        <p>{{ t('contact.methods.email.description') }}</p>
        <a class="secondary-action" href="mailto:fisherztz@gmail.com?subject=DrawStamp%20Studio反馈&body=请在此填写您的问题...">
          fisherztz@gmail.com
        </a>
      </article>
    </section>

    <section class="feedback-panel">
      <div>
        <p class="section-label">{{ t('contact.form.title') }}</p>
        <h2>打开邮件草稿</h2>
        <p>{{ t('contact.form.description') }}</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <label>
          {{ t('contact.form.name') }}
          <input type="text" v-model="form.name" />
        </label>
        <label>
          {{ t('contact.form.email') }}
          <input type="email" v-model="form.email" />
        </label>
        <label>
          {{ t('contact.form.subject') }}
          <select v-model="form.subject">
            <option value="question">{{ t('contact.form.subjects.question') }}</option>
            <option value="bug">{{ t('contact.form.subjects.bug') }}</option>
            <option value="suggestion">{{ t('contact.form.subjects.suggestion') }}</option>
            <option value="other">{{ t('contact.form.subjects.other') }}</option>
          </select>
        </label>
        <label class="wide-field">
          {{ t('contact.form.message') }}
          <textarea v-model="form.message" rows="5" required></textarea>
        </label>
        <button type="submit">{{ t('contact.form.submit') }}</button>
        <p v-if="submitStatus" class="submit-status" :class="submitStatus">
          {{ submitStatus === 'success' ? t('contact.form.status.success') : t('contact.form.status.error') }}
        </p>
      </form>
    </section>

    <section class="support-grid">
      <article>
        <p class="section-label">{{ t('contact.methods.bugReport.title') }}</p>
        <p>{{ t('contact.methods.bugReport.description') }}</p>
      </article>
      <article>
        <p class="section-label">{{ t('contact.methods.suggestion.title') }}</p>
        <p>{{ t('contact.methods.suggestion.description') }}</p>
      </article>
      <article>
        <p class="section-label">{{ t('contact.methods.contribute.title') }}</p>
        <p>{{ t('contact.methods.contribute.description') }}</p>
      </article>
    </section>

    <section class="faq-strip">
      <article
        v-for="item in faqItems"
        :key="item.question"
      >
        <h3>{{ item.question }}</h3>
        <p>{{ item.answer }}</p>
      </article>
    </section>
  </InfoPageShell>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import InfoPageShell from './InfoPageShell.vue'

const { t } = useI18n()

const TELEGRAM_USERNAME = 'KEVIN627ZTZ'
const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}`
const COMPANY_EMAIL = 'fisherztz@gmail.com'

const form = ref({
  name: '',
  email: '',
  subject: 'question',
  message: ''
})

const submitStatus = ref<'success' | 'error' | null>(null)

const subjectLabels = computed(() => ({
  question: t('contact.form.subjects.question'),
  bug: t('contact.form.subjects.bug'),
  suggestion: t('contact.form.subjects.suggestion'),
  other: t('contact.form.subjects.other')
}))

const faqItems = computed(() => [
  {
    question: t('contact.faq.questions.q1.question'),
    answer: t('contact.faq.questions.q1.answer')
  },
  {
    question: t('contact.faq.questions.q2.question'),
    answer: t('contact.faq.questions.q2.answer')
  },
  {
    question: t('contact.faq.questions.q3.question'),
    answer: t('contact.faq.questions.q3.answer')
  },
  {
    question: t('contact.faq.questions.q4.question'),
    answer: t('contact.faq.questions.q4.answer')
  },
  {
    question: t('contact.faq.questions.q5.question'),
    answer: t('contact.faq.questions.q5.answer')
  }
])

const handleSubmit = () => {
  if (!form.value.message.trim()) {
    submitStatus.value = 'error'
    return
  }

  const subjectText = subjectLabels.value[form.value.subject] || t('contact.form.subjects.other')
  const subject = encodeURIComponent(`DrawStamp Studio ${subjectText}`)
  const bodyLines = [
    `姓名：${form.value.name || '未填写'}`,
    `联系邮箱：${form.value.email || '未填写'}`,
    `主题：${subjectText}`,
    '',
    '反馈内容：',
    form.value.message
  ]
  const body = encodeURIComponent(bodyLines.join('\n'))

  try {
    window.location.href = `mailto:${COMPANY_EMAIL}?subject=${subject}&body=${body}`
    submitStatus.value = 'success'
  } catch (error) {
    console.error('生成邮件链接失败', error)
    submitStatus.value = 'error'
  }
}
</script>

<style scoped>
.contact-aside,
.contact-card,
.feedback-panel,
.support-grid article,
.faq-strip article {
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid var(--studio-line-hair);
  border-radius: 16px;
  box-shadow: var(--studio-shadow-quiet);
}

.contact-aside {
  display: grid;
  gap: 12px;
  justify-items: center;
  padding: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(232, 242, 245, 0.58)),
    #ffffff;
}

.contact-aside img {
  width: 100%;
  max-width: 220px;
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px var(--studio-line-hair);
}

.contact-aside strong {
  color: var(--studio-tool-blue);
  font-size: 16px;
}

.contact-aside a,
.primary-action,
.secondary-action,
.feedback-panel button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-weight: 900;
  text-decoration: none;
}

.contact-aside a,
.primary-action,
.feedback-panel button {
  color: #fff;
  background: var(--studio-tool-blue);
}

.contact-aside a {
  width: 100%;
  padding: 10px 14px;
}

.contact-primary {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 14px;
}

.contact-card {
  padding: 24px;
}

.telegram-card {
  background:
    radial-gradient(circle at 94% 0%, rgba(46, 111, 143, 0.14), transparent 36%),
    rgba(255, 255, 255, 0.78);
}

.contact-card:hover,
.feedback-panel:hover,
.contact-aside:hover {
  border-color: rgba(46, 111, 143, 0.22);
}

.section-label {
  margin: 0 0 10px;
  color: var(--studio-tool-blue);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.contact-card h2,
.feedback-panel h2 {
  margin: 0 0 10px;
  color: var(--studio-ink);
  font-size: clamp(22px, 2.4vw, 32px);
  letter-spacing: -0.04em;
}

.contact-card p,
.feedback-panel p,
.support-grid p,
.faq-strip p {
  color: var(--studio-muted);
  line-height: 1.8;
}

.primary-action,
.secondary-action {
  margin-top: 10px;
  padding: 10px 16px;
}

.secondary-action {
  color: var(--studio-tool-blue);
  background: var(--studio-tool-blue-soft);
}

.feedback-panel {
  display: grid;
  grid-template-columns: minmax(220px, 0.7fr) minmax(0, 1.3fr);
  gap: 22px;
  margin-top: 14px;
  padding: 24px;
}

.feedback-panel form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.feedback-panel label {
  display: grid;
  gap: 7px;
  color: var(--studio-ink);
  font-size: 14px;
  font-weight: 800;
}

.feedback-panel input,
.feedback-panel select,
.feedback-panel textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 12px;
  color: var(--studio-ink);
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  font: inherit;
}

.feedback-panel input:focus,
.feedback-panel select:focus,
.feedback-panel textarea:focus {
  border-color: var(--studio-tool-blue);
  box-shadow: var(--studio-focus);
  outline: none;
}

.wide-field,
.feedback-panel button,
.submit-status {
  grid-column: 1 / -1;
}

.feedback-panel textarea {
  resize: vertical;
}

.feedback-panel button {
  padding: 12px 18px;
  border: 0;
  cursor: pointer;
}

.submit-status {
  margin: 0;
  padding: 12px;
  border-radius: 10px;
}

.submit-status.success {
  color: #235633;
  background: #e6f3ea;
}

.submit-status.error {
  color: #9c1d28;
  background: #fff0f1;
}

.support-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.support-grid article,
.faq-strip article {
  padding: 18px;
}

.faq-strip {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.faq-strip h3 {
  margin: 0 0 8px;
  color: var(--studio-ink);
  font-size: 17px;
}

.faq-strip p {
  margin: 0;
}

@media (max-width: 860px) {
  .contact-primary,
  .feedback-panel,
  .support-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .feedback-panel form {
    grid-template-columns: 1fr;
  }
}
</style>
