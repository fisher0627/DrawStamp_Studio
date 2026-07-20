<template>
  <div class="extractor-overlay" @click.self="close">
    <section class="extractor-dialog" :aria-label="t('studio.extractor.aria')">
      <header class="extractor-header">
        <div>
          <h2>{{ t('studio.extractor.title') }}</h2>
        </div>
        <button type="button" class="extractor-close" @click="close" :title="t('studio.extractor.close')">×</button>
      </header>

      <div class="extractor-body">
        <div class="extractor-upload">
          <label
            class="drop-zone"
            :class="{ filled: sourceUrl, dragging: isDraggingOver }"
            @dragenter.prevent="handleDragEnter"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <input ref="uploadInput" type="file" accept="image/*" @change="handleFileChange" />
            <span class="drop-mark">取</span>
            <strong>{{ selectedFile ? selectedFile.name : t('studio.extractor.drop') }}</strong>
            <small>{{ t('studio.extractor.support') }}</small>
            <span class="drop-hint">{{ t('studio.extractor.dropHint') }}</span>
          </label>

          <div class="source-card">
            <div class="preview-title">
              <span>{{ t('studio.extractor.sourcePreview') }}</span>
              <small>{{ sourceSize || t('studio.extractor.waitingUpload') }}</small>
            </div>
            <div class="source-preview" :class="{ empty: !sourceUrl }">
              <img v-if="sourceUrl" :src="sourceUrl" :alt="t('studio.extractor.sourcePreview')" />
              <span v-else>{{ t('studio.extractor.sourcePlaceholder') }}</span>
            </div>
          </div>
        </div>

        <div class="extractor-controls">
          <section class="settings-card">
            <div class="settings-title">
              <span>{{ t('studio.extractor.parameters') }}</span>
              <small>{{ selectedFile ? t('studio.extractor.autoPreviewed') : t('studio.extractor.tuneAfterUpload') }}</small>
            </div>

            <div class="control-row">
              <label>
                <span>{{ t('studio.extractor.retainRange') }}</span>
                <strong>{{ threshold }}</strong>
              </label>
              <input v-model.number="threshold" type="range" min="0" max="100" step="1" @input="scheduleProcess" />
            </div>

            <div class="control-row">
              <label>
                <span>{{ t('studio.extractor.cleanup') }}</span>
                <strong>{{ cleanup }}</strong>
              </label>
              <input v-model.number="cleanup" type="range" min="0" max="4" step="1" @input="scheduleProcess" />
            </div>

            <label class="color-row">
              <span>{{ t('studio.extractor.outputColor') }}</span>
              <input v-model="targetColor" type="color" @input="scheduleProcess" />
            </label>
          </section>

          <div class="toggle-grid">
            <label>
              <input v-model="transparentBackground" type="checkbox" @change="scheduleProcess" />
              <span>{{ t('studio.extractor.transparent') }}</span>
            </label>
            <label>
              <input v-model="edgeEnhance" type="checkbox" @change="scheduleProcess" />
              <span>{{ t('studio.extractor.enhance') }}</span>
            </label>
            <label>
              <input v-model="preserveShading" type="checkbox" @change="scheduleProcess" />
              <span>{{ t('studio.extractor.preserveTones') }}</span>
            </label>
          </div>

          <div class="result-panel" :class="{ empty: !resultUrl }">
            <div class="preview-title">
              <span>{{ t('studio.extractor.resultTitle') }}</span>
              <div class="preview-actions">
                <small>{{ resultMeta || t('studio.extractor.live') }}</small>
                <button type="button" @click="triggerUpload">{{ t('studio.extractor.reupload') }}</button>
                <button type="button" :disabled="!resultUrl" @click="clearResult">{{ t('studio.extractor.clear') }}</button>
              </div>
            </div>
            <div class="result-preview">
              <img v-if="resultUrl" :src="resultUrl" :alt="t('studio.extractor.resultTitle')" />
              <span v-else>{{ statusText }}</span>
            </div>
          </div>
        </div>
      </div>

      <footer class="extractor-footer">
        <p>{{ helperText }}</p>
        <div>
          <button type="button" class="extractor-secondary" @click="close">{{ t('studio.extractor.cancel') }}</button>
          <button type="button" class="extractor-primary" :disabled="!resultUrl" @click="addToCanvas">
            {{ t('studio.extractor.replaceCanvas') }}
          </button>
        </div>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { extractStampFromFile, type ExtractStampResult } from '../../utils/extractStampImage'
import { DEFAULT_STAMP_RED } from '../../Constants'

const props = defineProps<{
  primaryColor: string
}>()

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add-image', payload: ExtractStampResult): void
}>()

const selectedFile = ref<File | null>(null)
const uploadInput = ref<HTMLInputElement | null>(null)
const sourceUrl = ref('')
const sourceWidth = ref(0)
const sourceHeight = ref(0)
const result = ref<ExtractStampResult | null>(null)
const errorMessage = ref('')
const isProcessing = ref(false)
const threshold = ref(68)
const cleanup = ref(2)
const targetColor = ref(DEFAULT_STAMP_RED)
const transparentBackground = ref(true)
const preserveShading = ref(true)
const edgeEnhance = ref(true)
const isDraggingOver = ref(false)
let processTimer = 0
let isDisposed = false

const sourceSize = computed(() => (
  sourceWidth.value && sourceHeight.value ? `${sourceWidth.value} x ${sourceHeight.value}px` : ''
))

const resultUrl = computed(() => result.value?.dataUrl || '')

const resultMeta = computed(() => {
  if (!result.value) return ''
  const ratio = result.value.totalPixels
    ? Math.round((result.value.redPixels / result.value.totalPixels) * 1000) / 10
    : 0
  return t('studio.extractor.resultMeta', {
    width: result.value.width,
    height: result.value.height,
    ratio
  })
})

const statusText = computed(() => {
  if (isProcessing.value) return t('studio.extractor.processing')
  if (errorMessage.value) return errorMessage.value
  return t('studio.extractor.readyHint')
})

const helperText = computed(() => {
  if (errorMessage.value) return t('studio.extractor.errorHint')
  return t('studio.extractor.replaceHint')
})

watch(
  () => props.primaryColor,
  (value) => {
    if (!targetColor.value && value) {
      targetColor.value = value
    }
  }
)

const cleanupResources = () => {
  isDisposed = true
  window.clearTimeout(processTimer)
  processTimer = 0
  if (sourceUrl.value) {
    URL.revokeObjectURL(sourceUrl.value)
    sourceUrl.value = ''
  }
}

const close = () => {
  cleanupResources()
  emit('close')
}

const process = async () => {
  if (!selectedFile.value || isDisposed) return

  isProcessing.value = true
  errorMessage.value = ''

  try {
    const nextResult = await extractStampFromFile(selectedFile.value, {
      threshold: threshold.value,
      cleanup: cleanup.value,
      targetColor: targetColor.value,
      transparentBackground: transparentBackground.value,
      preserveShading: preserveShading.value,
      edgeEnhance: edgeEnhance.value
    })
    if (isDisposed) return
    result.value = nextResult
  } catch (error) {
    if (isDisposed) return
    result.value = null
    errorMessage.value = error instanceof Error && error.message.includes('红色印章')
      ? t('studio.extractor.noRedArea')
      : t('studio.extractor.failed')
  } finally {
    if (!isDisposed) {
      isProcessing.value = false
    }
  }
}

const scheduleProcess = () => {
  if (isDisposed) return
  window.clearTimeout(processTimer)
  processTimer = window.setTimeout(() => {
    void process()
  }, 180)
}

const readSourceSize = async (file: File) => {
  const bitmap = await createImageBitmap(file)
  sourceWidth.value = bitmap.width
  sourceHeight.value = bitmap.height
  bitmap.close()
}

const applyFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    result.value = null
    errorMessage.value = t('studio.extractor.chooseImage')
    return
  }

  if (!file) return

  selectedFile.value = file
  result.value = null
  errorMessage.value = ''

  if (sourceUrl.value) {
    URL.revokeObjectURL(sourceUrl.value)
  }
  sourceUrl.value = URL.createObjectURL(file)

  try {
    await readSourceSize(file)
  } catch {
    sourceWidth.value = 0
    sourceHeight.value = 0
  }

  await process()
}

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  await applyFile(file)
  input.value = ''
}

const triggerUpload = () => {
  uploadInput.value?.click()
}

const clearResult = () => {
  result.value = null
  errorMessage.value = ''
}

const handleDragEnter = () => {
  isDraggingOver.value = true
}

const handleDragOver = () => {
  isDraggingOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
  const current = event.currentTarget as HTMLElement
  const related = event.relatedTarget as Node | null
  if (!related || !current.contains(related)) {
    isDraggingOver.value = false
  }
}

const handleDrop = async (event: DragEvent) => {
  isDraggingOver.value = false
  const file = Array.from(event.dataTransfer?.files || []).find(item => item.type.startsWith('image/'))
  if (!file) {
    result.value = null
    errorMessage.value = t('studio.extractor.noImage')
    return
  }
  await applyFile(file)
}

const addToCanvas = () => {
  if (!result.value) return
  emit('add-image', result.value)
  close()
}

onUnmounted(cleanupResources)
</script>

<style scoped>
.extractor-overlay {
  position: fixed;
  inset: 0;
  z-index: 2300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(32, 37, 34, 0.48);
  backdrop-filter: blur(6px);
}

.extractor-dialog {
  width: min(1080px, 96vw);
  max-height: min(780px, 92vh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--studio-line-strong);
  border-radius: 14px;
  background: #f4f5f1;
  box-shadow: 0 28px 70px rgba(32, 37, 34, 0.28);
}

.extractor-header,
.extractor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 15px 18px;
  background: var(--studio-panel);
}

.extractor-header {
  border-bottom: 1px solid var(--studio-line);
}

.extractor-header h2 {
  margin: 0;
  color: var(--studio-ink);
  font-size: 18px;
  line-height: 1.25;
}

.panel-eyebrow {
  display: block;
  margin-bottom: 2px;
  color: var(--studio-muted);
  font-size: 10px;
  line-height: 1.3;
  text-transform: uppercase;
}

.extractor-close {
  width: 32px;
  min-width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: #eef1eb;
  color: var(--studio-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  line-height: 1;
  appearance: none;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.extractor-close:hover {
  background: #f7eeee;
  color: var(--studio-ui-red);
  transform: rotate(90deg);
}

.extractor-body {
  display: grid;
  grid-template-columns: minmax(420px, 1.1fr) minmax(340px, 0.9fr);
  gap: 16px;
  min-height: 0;
  padding: 16px;
  overflow: auto;
}

.extractor-upload,
.extractor-controls {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.drop-zone {
  min-height: 196px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  border: 1px dashed var(--studio-line-strong);
  border-radius: 10px;
  background: linear-gradient(180deg, #fffefa, #f7f8f3);
  color: var(--studio-ink);
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.2s;
}

.drop-zone:hover,
.drop-zone.filled,
.drop-zone.dragging {
  border-color: var(--studio-ui-red);
  background: #fff8f6;
  box-shadow: inset 0 0 0 1px rgba(163, 58, 50, 0.06), var(--studio-shadow-panel);
}

.drop-zone.dragging {
  border-style: solid;
  transform: translateY(-1px);
}

.drop-zone input {
  display: none;
}

.drop-mark {
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f7eeee;
  color: var(--studio-ui-red);
  font-weight: 800;
  font-size: 18px;
}

.drop-zone strong {
  max-width: 100%;
  overflow: hidden;
  color: var(--studio-ink);
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drop-hint {
  margin-top: 2px;
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--studio-tool-blue-soft);
  color: var(--studio-tool-blue);
  font-size: 12px;
}

.drop-zone small,
.preview-title small,
.extractor-footer p {
  color: var(--studio-muted);
  font-size: 12px;
}

.source-card,
.result-panel {
  min-height: 0;
  border: 1px solid var(--studio-line-hair);
  border-radius: 10px;
  background: var(--studio-panel);
  overflow: hidden;
}

.preview-title {
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 11px;
  border-bottom: 1px solid var(--studio-line-hair);
  color: var(--studio-ink);
  font-size: 13px;
  font-weight: 700;
}

.preview-actions {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.preview-actions button {
  min-height: 24px;
  padding: 3px 8px;
  border: 1px solid var(--studio-line-hair);
  border-radius: 7px;
  background: var(--studio-panel);
  color: var(--studio-muted);
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.preview-actions button:hover:not(:disabled) {
  border-color: var(--studio-ui-red);
  color: var(--studio-ui-red);
}

.preview-actions button:disabled {
  cursor: not-allowed;
  color: #a4adba;
  background: #f4f6f8;
}

.source-preview {
  min-height: 238px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background:
    linear-gradient(rgba(191, 200, 187, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(191, 200, 187, 0.3) 1px, transparent 1px);
  background-color: #f4f5f1;
  background-size: 24px 24px;
  color: var(--studio-muted);
  font-size: 13px;
}

.source-preview.empty {
  background: #f8fafc;
}

.source-preview img {
  width: 100%;
  max-height: 360px;
  display: block;
  object-fit: contain;
}

.settings-card,
.toggle-grid label {
  border: 1px solid var(--studio-line-hair);
  border-radius: 10px;
  background: var(--studio-panel);
}

.settings-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.settings-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--studio-ink);
  font-size: 13px;
  font-weight: 700;
}

.settings-title small {
  color: var(--studio-muted);
  font-size: 12px;
  font-weight: 500;
}

.control-row {
  padding: 0;
}

.control-row label,
.color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  color: var(--studio-ink);
  font-size: 13px;
  font-weight: 700;
}

.control-row input[type="range"] {
  width: 100%;
  margin: 12px 0 0;
  accent-color: var(--studio-ui-red);
}

.color-row {
  padding: 2px 0 0;
}

.color-row input {
  width: 42px;
  height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
}

.toggle-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.toggle-grid label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  color: var(--studio-ink);
  font-size: 13px;
}

.toggle-grid input {
  accent-color: var(--studio-ui-red);
}

.result-preview {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  background:
    linear-gradient(45deg, #f0f2f5 25%, transparent 25%),
    linear-gradient(-45deg, #f0f2f5 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f2f5 75%),
    linear-gradient(-45deg, transparent 75%, #f0f2f5 75%);
  background-color: #ffffff;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
  background-size: 20px 20px;
  color: #7a8495;
  font-size: 13px;
}

.result-preview img {
  max-width: 100%;
  max-height: 360px;
  object-fit: contain;
}

.result-panel.empty .result-preview {
  background: #f8fafc;
}

.extractor-footer {
  border-top: 1px solid var(--studio-line);
}

.extractor-footer p {
  margin: 0;
  text-align: left;
}

.extractor-footer div {
  display: flex;
  gap: 10px;
}

.extractor-secondary,
.extractor-primary {
  min-height: 34px;
  padding: 7px 13px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.extractor-secondary {
  border: 1px solid var(--studio-line);
  background: var(--studio-panel);
  color: var(--studio-muted);
}

.extractor-secondary:hover {
  border-color: var(--studio-line-strong);
  background: #f7f8f3;
  color: var(--studio-ink);
}

.extractor-primary {
  border: 1px solid var(--studio-ui-red);
  background: var(--studio-ui-red);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(132, 43, 38, 0.18);
}

.extractor-primary:hover:not(:disabled) {
  border-color: var(--studio-ui-red-deep);
  background: var(--studio-ui-red-deep);
  transform: translateY(-1px);
}

.extractor-primary:disabled {
  cursor: not-allowed;
  border-color: #d8dee7;
  background: #e6ebf1;
  color: #9aa5b4;
  box-shadow: none;
}

@media (max-width: 860px) {
  .extractor-body {
    grid-template-columns: 1fr;
  }

  .extractor-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .extractor-footer div {
    justify-content: flex-end;
  }

  .toggle-grid {
    grid-template-columns: 1fr;
  }
}
</style>
