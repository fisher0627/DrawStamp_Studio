<template>
  <div class="extractor-overlay" @click.self="close">
    <section class="extractor-dialog" aria-label="从图片提取印章">
      <header class="extractor-header">
        <div>
          <span class="panel-eyebrow">Extract</span>
          <h2>从图片提取印章</h2>
        </div>
        <button type="button" class="extractor-close" @click="close" title="关闭">×</button>
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
            <strong>{{ selectedFile ? selectedFile.name : '拖拽图片到这里，或点击选择' }}</strong>
            <small>支持 PNG / JPG / 扫描件，本地处理，不上传图片。</small>
            <span class="drop-hint">松手后自动提取红色印章</span>
          </label>

          <div class="source-card">
            <div class="preview-title">
              <span>原图预览</span>
              <small>{{ sourceSize || '等待上传' }}</small>
            </div>
            <div class="source-preview" :class="{ empty: !sourceUrl }">
              <img v-if="sourceUrl" :src="sourceUrl" alt="原图预览" />
              <span v-else>图片会显示在这里，方便和右侧结果对照。</span>
            </div>
          </div>
        </div>

        <div class="extractor-controls">
          <section class="settings-card">
            <div class="settings-title">
              <span>提取参数</span>
              <small>{{ selectedFile ? '已自动预览' : '上传后可微调' }}</small>
            </div>

            <div class="control-row">
              <label>
                <span>保留范围</span>
                <strong>{{ threshold }}</strong>
              </label>
              <input v-model.number="threshold" type="range" min="0" max="100" step="1" @input="scheduleProcess" />
            </div>

            <div class="control-row">
              <label>
                <span>杂点清理</span>
                <strong>{{ cleanup }}</strong>
              </label>
              <input v-model.number="cleanup" type="range" min="0" max="4" step="1" @input="scheduleProcess" />
            </div>

            <label class="color-row">
              <span>输出颜色</span>
              <input v-model="targetColor" type="color" @input="scheduleProcess" />
            </label>
          </section>

          <div class="toggle-grid">
            <label>
              <input v-model="transparentBackground" type="checkbox" @change="scheduleProcess" />
              <span>透明背景</span>
            </label>
            <label>
              <input v-model="edgeEnhance" type="checkbox" @change="scheduleProcess" />
              <span>边缘增强</span>
            </label>
            <label>
              <input v-model="preserveShading" type="checkbox" @change="scheduleProcess" />
              <span>保留深浅</span>
            </label>
          </div>

          <div class="result-panel" :class="{ empty: !resultUrl }">
            <div class="preview-title">
              <span>透明 PNG 结果</span>
              <div class="preview-actions">
                <small>{{ resultMeta || '实时生成' }}</small>
                <button type="button" @click="triggerUpload">重新上传</button>
                <button type="button" :disabled="!resultUrl" @click="clearResult">清除结果</button>
              </div>
            </div>
            <div class="result-preview">
              <img v-if="resultUrl" :src="resultUrl" alt="提取结果预览" />
              <span v-else>{{ statusText }}</span>
            </div>
          </div>
        </div>
      </div>

      <footer class="extractor-footer">
        <p>{{ helperText }}</p>
        <div>
          <button type="button" class="extractor-secondary" @click="close">取消</button>
          <button type="button" class="extractor-primary" :disabled="!resultUrl" @click="addToCanvas">
            替换画布
          </button>
        </div>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { extractStampFromFile, type ExtractStampResult } from '../../utils/extractStampImage'
import { DEFAULT_STAMP_RED } from '../../Constants'

const props = defineProps<{
  primaryColor: string
}>()

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
  return `${result.value.width} x ${result.value.height}px · 红色区域 ${ratio}%`
})

const statusText = computed(() => {
  if (isProcessing.value) return '正在提取...'
  if (errorMessage.value) return errorMessage.value
  return '选择图片后自动生成透明 PNG'
})

const helperText = computed(() => {
  if (errorMessage.value) return '如果漏章，提高保留范围；如果背景杂点多，提高杂点清理。'
  return '确认后会清空默认章面，只保留提取结果；右侧仍可继续调整尺寸、位置和旋转。'
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
    errorMessage.value = error instanceof Error ? error.message : '提取失败，请换一张更清晰的图片'
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
    errorMessage.value = '请拖入或选择图片文件'
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
    errorMessage.value = '没有检测到图片文件'
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
  background: rgba(23, 30, 42, 0.48);
  backdrop-filter: blur(6px);
}

.extractor-dialog {
  width: min(1080px, 96vw);
  max-height: min(780px, 92vh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(197, 205, 218, 0.86);
  border-radius: 10px;
  background: #f7f8fa;
  box-shadow: 0 28px 70px rgba(21, 31, 49, 0.28);
}

.extractor-header,
.extractor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 15px 18px;
  background: #ffffff;
}

.extractor-header {
  border-bottom: 1px solid #dce2eb;
}

.extractor-header h2 {
  margin: 0;
  color: #202733;
  font-size: 18px;
  line-height: 1.25;
}

.panel-eyebrow {
  display: block;
  margin-bottom: 2px;
  color: #7a8495;
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
  background: #f3f6fa;
  color: #59677a;
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
  background: #f6eef0;
  color: #bd2431;
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
  border: 1px dashed #b9c6d7;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  color: #303b4b;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.2s;
}

.drop-zone:hover,
.drop-zone.filled,
.drop-zone.dragging {
  border-color: #bd2431;
  background: #fffafa;
  box-shadow: inset 0 0 0 1px rgba(189, 36, 49, 0.06), 0 10px 26px rgba(38, 49, 68, 0.08);
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
  background: #f6eef0;
  color: #bd2431;
  font-weight: 800;
  font-size: 18px;
}

.drop-zone strong {
  max-width: 100%;
  overflow: hidden;
  color: #202733;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drop-hint {
  margin-top: 2px;
  padding: 4px 9px;
  border-radius: 999px;
  background: #eef3f8;
  color: #5f6f84;
  font-size: 12px;
}

.drop-zone small,
.preview-title small,
.extractor-footer p {
  color: #7a8495;
  font-size: 12px;
}

.source-card,
.result-panel {
  min-height: 0;
  border: 1px solid #dce2eb;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
}

.preview-title {
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 11px;
  border-bottom: 1px solid #e6eaf0;
  color: #303b4b;
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
  border: 1px solid #d9dee7;
  border-radius: 6px;
  background: #ffffff;
  color: #47566a;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.preview-actions button:hover:not(:disabled) {
  border-color: #bd2431;
  color: #bd2431;
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
    linear-gradient(#e8edf3 1px, transparent 1px),
    linear-gradient(90deg, #e8edf3 1px, transparent 1px);
  background-color: #f8fafc;
  background-size: 24px 24px;
  color: #7a8495;
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
  border: 1px solid #dce2eb;
  border-radius: 8px;
  background: #ffffff;
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
  color: #202733;
  font-size: 13px;
  font-weight: 700;
}

.settings-title small {
  color: #7a8495;
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
  color: #303b4b;
  font-size: 13px;
  font-weight: 700;
}

.control-row input[type="range"] {
  width: 100%;
  margin: 12px 0 0;
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
  color: #303b4b;
  font-size: 13px;
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
  border-top: 1px solid #dce2eb;
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
}

.extractor-secondary {
  border: 1px solid #d9dee7;
  background: #ffffff;
  color: #47566a;
}

.extractor-primary {
  border: 1px solid #bd2431;
  background: #bd2431;
  color: #ffffff;
}

.extractor-primary:disabled {
  cursor: not-allowed;
  border-color: #d8dee7;
  background: #e6ebf1;
  color: #9aa5b4;
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
