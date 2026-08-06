<template>
  <!-- 导出模板元信息弹窗 -->
  <div v-if="modelValue" class="legal-dialog-overlay" @click.self="handleCancel">
    <div class="legal-dialog">
      <h3>{{ t('homepage.canvas.exportTemplate') }}</h3>
      <div class="legal-content">
        <div class="meta-field">
          <label>{{ t('stamp.templateMeta.titlePrompt') }}</label>
          <input
            v-model="title"
            type="text"
            class="meta-input"
            :placeholder="t('stamp.templateMeta.titlePrompt')"
          />
        </div>
        <div class="meta-field">
          <label>{{ t('stamp.templateMeta.categoryPrompt') }}</label>
          <input
            v-model="categories"
            type="text"
            class="meta-input"
            :placeholder="t('stamp.templateMeta.categoryPrompt')"
          />
        </div>
      </div>
      <div class="dialog-buttons">
        <button @click="handleCancel" class="cancel-button">
          {{ t('stamp.exportFormat.cancel') }}
        </button>
        <button @click="handleConfirm" class="confirm-button">
          {{ t('stamp.exportFormat.export') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  modelValue: boolean
  defaultTitle?: string
  defaultCategories?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', payload: { title: string; categories: string }): void
  (e: 'cancel'): void
}>()

const { t } = useI18n()

const title = ref('')
const categories = ref('')

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      title.value = props.defaultTitle || ''
      categories.value = props.defaultCategories || ''
    }
  }
)

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm', {
    title: title.value.trim(),
    categories: categories.value.trim()
  })
}
</script>

<style scoped>
.meta-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.meta-input {
  padding: 6px 10px;
  border: 1px solid var(--studio-line);
  border-radius: 6px;
  font-size: 13px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.meta-input:focus {
  border-color: rgba(35, 76, 92, 0.34);
  box-shadow: var(--studio-focus);
  outline: none;
}
</style>
