<template>
  <!-- 导出格式弹窗 -->
  <div v-if="showFormatDialog" class="legal-dialog-overlay" @click.self="closeFormatDialog">
    <div class="legal-dialog">
      <h3>{{ t('stamp.exportFormat.title') }}</h3>
      <div class="legal-content">
        <p>{{ t('stamp.exportFormat.description') }}</p>
        <div class="format-options">
          <button
            v-for="format in exportFormats"
            :key="format.value"
            type="button"
            class="format-button"
            :class="{ active: selectedFormat === format.value }"
            @click="selectedFormat = format.value"
          >
            <span class="format-icon">{{ format.icon }}</span>
            <span class="format-name">{{ format.name }}</span>
            <span class="format-desc">{{ format.desc }}</span>
          </button>
        </div>
        <div v-if="selectedFormat === 'jpeg'" class="quality-setting">
          <label>{{ t('stamp.exportFormat.quality') }}: {{ jpegQuality }}%</label>
          <input
            type="range"
            v-model.number="jpegQuality"
            min="10"
            max="100"
            step="5"
            class="quality-slider"
          />
        </div>
        <div class="export-quick-settings">
          <div class="quick-setting">
            <label>导出倍率</label>
            <div class="scale-options">
              <button
                v-for="option in scaleOptions"
                :key="option.value"
                type="button"
                class="scale-button"
                :class="{ active: selectedScale === option.value }"
                @click="applyExportScale(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
          <label v-if="selectedFormat === 'png'" class="export-checkbox">
            <input type="checkbox" v-model="useWhitePngBackground" />
            <span>PNG 使用白色背景</span>
          </label>
          <div class="quick-setting">
            <label>文件名</label>
            <input
              v-model="exportFilename"
              type="text"
              class="export-name-input"
              placeholder="自动使用公司名"
            />
          </div>
        </div>
        <div class="size-setting">
          <div class="size-setting-header">
            <label>{{ t('stamp.exportFormat.sizeTitle') }}</label>
            <button class="size-reset" type="button" @click="resetExportSize">
              {{ t('stamp.exportFormat.resetSize') }}
            </button>
          </div>
          <div class="ratio-setting">
            <label>{{ t('stamp.exportFormat.ratioTitle') }}</label>
            <div class="ratio-options">
              <button
                v-for="option in ratioOptions"
                :key="option.value"
                type="button"
                class="ratio-button"
                :class="{ active: selectedRatio === option.value }"
                @click="applyRatio(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            <p class="ratio-hint">{{ t('stamp.exportFormat.ratioHint') }}</p>
          </div>
          <div class="size-inputs">
            <div class="size-field">
              <span>{{ t('stamp.exportFormat.width') }} (px)</span>
              <input
                type="number"
                v-model.number="exportWidth"
                :min="MIN_EXPORT_SIZE"
                :max="MAX_EXPORT_SIZE"
                @input="handleWidthInput"
                @change="handleWidthInput"
              />
            </div>
            <div class="size-field">
              <span>{{ t('stamp.exportFormat.height') }} (px)</span>
              <input
                type="number"
                v-model.number="exportHeight"
                :min="MIN_EXPORT_SIZE"
                :max="MAX_EXPORT_SIZE"
                @input="handleHeightInput"
                @change="handleHeightInput"
              />
            </div>
          </div>
          <p class="size-hint">
            {{ t('stamp.exportFormat.sizeHint', { width: Math.round(defaultExportWidth) || 0, height: Math.round(defaultExportHeight) || 0 }) }}
          </p>
          <p class="size-hint">
            {{ t('stamp.exportFormat.sizeLimit', { min: MIN_EXPORT_SIZE, max: MAX_EXPORT_SIZE }) }}
          </p>
        </div>
      </div>
      <div class="dialog-buttons">
        <button @click="closeFormatDialog" class="cancel-button">{{ t('stamp.exportFormat.cancel') }}</button>
        <button @click="confirmExport" class="confirm-button">{{ t('stamp.exportFormat.export') }}</button>
      </div>
    </div>
  </div>

  <!-- 导出模板元信息弹窗 -->
  <div v-if="showTemplateMetaDialog" class="legal-dialog-overlay" @click.self="closeTemplateMetaDialog">
    <div class="legal-dialog">
      <h3>{{ t('homepage.canvas.exportTemplate') }}</h3>
      <div class="legal-content">
        <div class="meta-field">
          <label>{{ t('stamp.templateMeta.titlePrompt') }}</label>
          <input
            v-model="templateTitle"
            type="text"
            class="meta-input"
            :placeholder="t('stamp.templateMeta.titlePrompt')"
          />
        </div>
        <div class="meta-field">
          <label>{{ t('stamp.templateMeta.categoryPrompt') }}</label>
          <input
            v-model="templateCategories"
            type="text"
            class="meta-input"
            :placeholder="t('stamp.templateMeta.categoryPrompt')"
          />
        </div>
      </div>
      <div class="dialog-buttons">
        <button @click="closeTemplateMetaDialog" class="cancel-button">
          {{ t('stamp.exportFormat.cancel') }}
        </button>
        <button @click="confirmSaveTemplate" class="confirm-button">
          {{ t('stamp.exportFormat.export') }}
        </button>
      </div>
    </div>
  </div>

  <StampExtractor
    v-if="showExtractorDialog"
    :primary-color="stampStore.state.config?.primaryColor || '#c91523'"
    @close="closeExtractorDialog"
    @add-image="handleExtractedStampImage"
  />

  <!-- 主内容区域：三栏布局（可复用） -->
  <div class="main-workspace">
    <!-- 顶部快速工具栏 -->
    <div class="top-toolbar" v-if="isDrawStampUtilsReady">
      <div class="toolbar-brand">
        <div>
          <p class="toolbar-kicker">DrawStamp Studio</p>
          <h1>电子印章工作台</h1>
        </div>
        <span class="toolbar-status">本地编辑</span>
      </div>
      <div class="toolbar-actions">
        <button class="toolbar-btn compact" type="button" @click="openExtractorDialog" title="从图片提取印章">
          <span class="toolbar-icon">取</span>
          <span class="toolbar-label">图片提取</span>
        </button>
        <button class="toolbar-btn compact" type="button" @click="triggerTemplateFileLoad" :title="t('homepage.canvas.importTemplate')">
          <span class="toolbar-icon">↓</span>
          <span class="toolbar-label">{{ t('homepage.canvas.importTemplate') }}</span>
        </button>
        <button class="toolbar-btn compact primary" type="button" @click="saveStampAsPNG" :title="t('homepage.canvas.download')">
          <span class="toolbar-icon">↧</span>
          <span class="toolbar-label">{{ t('homepage.canvas.download') }}</span>
        </button>
      </div>
    </div>

    <div class="stamp-draw-container">
      <!-- 左侧：模板与元素资源 -->
      <div class="workspace-left">
        <section class="template-library" v-if="isDrawStampUtilsReady" aria-label="常用模板">
          <div class="library-header">
            <div>
              <span class="panel-eyebrow">Template</span>
              <h2>常用模板</h2>
            </div>
            <button class="library-link" type="button" @click="triggerTemplateFileLoad">导入</button>
          </div>
          <div class="template-picker">
            <button
              type="button"
              class="template-current"
              :class="[`preset-${activeTemplatePresetInfo.key}`, { open: isTemplatePickerOpen }]"
              @click="isTemplatePickerOpen = !isTemplatePickerOpen"
              :aria-expanded="isTemplatePickerOpen"
            >
              <span class="preset-preview" aria-hidden="true">
                <span class="preset-stamp">
                  <span class="preset-ring"></span>
                  <span class="preset-star">★</span>
                  <span class="preset-type">{{ activeTemplatePresetInfo.mark }}</span>
                </span>
              </span>
              <span class="preset-copy">
                <span class="preset-row">
                  <strong>{{ activeTemplatePresetInfo.name }}</strong>
                  <em>{{ activeTemplatePresetInfo.badge }}</em>
                </span>
                <small>{{ activeTemplatePresetInfo.desc }}</small>
              </span>
              <span class="template-chevron" aria-hidden="true">⌄</span>
            </button>

            <div v-if="isTemplatePickerOpen" class="template-menu">
              <button
                v-for="preset in templatePresets"
                :key="preset.key"
                type="button"
                class="template-option"
                :class="[`preset-${preset.key}`, { active: activeTemplatePreset === preset.key }]"
                @click="applyTemplatePreset(preset.key); isTemplatePickerOpen = false"
              >
                <span class="preset-preview" aria-hidden="true">
                  <span class="preset-stamp">
                    <span class="preset-ring"></span>
                    <span class="preset-star">★</span>
                    <span class="preset-type">{{ preset.mark }}</span>
                  </span>
                </span>
                <span class="preset-copy">
                  <span class="preset-row">
                    <strong>{{ preset.name }}</strong>
                    <em>{{ preset.badge }}</em>
                  </span>
                  <small>{{ preset.desc }}</small>
                </span>
              </button>
            </div>
          </div>
        </section>
        <ElementList
          v-if="isDrawStampUtilsReady"
          ref="elementListRef"
          :drawStampUtils="drawStampUtils"
          @selectElement="handleSelectElement"
          @update-config="handleElementListUpdate"
          @refresh="handleElementListRefresh"
        />
        <div v-else class="side-panel-loading">
          <div class="loading-spinner"></div>
          <span>{{ t('common.loading') }}</span>
        </div>
      </div>

      <!-- 中间：Canvas 绘制区域 -->
      <div class="canvas-area">
        <div class="canvas-header">
          <div class="canvas-title">
            <span class="canvas-dot"></span>
            <div>
              <strong>Canvas 01</strong>
              <span>{{ canvasMeta }}</span>
            </div>
          </div>
          <div class="canvas-tools">
            <button class="canvas-action-btn" @click="zoomCanvas(0.9)" title="缩小">
              <span>−</span>
            </button>
            <button class="canvas-action-btn" @click="zoomCanvas(1.1)" title="放大">
              <span>＋</span>
            </button>
            <span class="zoom-indicator">{{ viewScalePercent }}%</span>
            <button class="canvas-action-btn" @click="fitCanvasToView" title="适配窗口">
              <span>⌖</span>
            </button>
            <button class="canvas-action-btn" @click="resetCanvasView" title="重置视图">
              <span>↺</span>
            </button>
            <button
              v-for="option in canvasBackgroundOptions"
              :key="option.value"
              class="canvas-action-btn"
              :class="{ active: canvasBackgroundMode === option.value }"
              @click="canvasBackgroundMode = option.value"
              :title="option.label"
            >
              <span>{{ option.icon }}</span>
            </button>
            <button class="canvas-action-btn" @click="openExtractorDialog" title="从图片提取印章">
              <span>取</span>
            </button>
            <button class="canvas-action-btn" @click="saveCurrentAsTemplate" :title="t('homepage.canvas.exportTemplate')">
              <span>⇪</span>
            </button>
            <button class="canvas-action-btn primary" @click="saveStampAsPNG" title="导出预览">
              <span>↧</span>
            </button>
          </div>
        </div>
        <div class="canvas-wrapper" :class="`canvas-bg-${canvasBackgroundMode}`">
          <div class="canvas-ruler horizontal"><span>0</span><span>300</span><span>600</span></div>
          <div class="canvas-ruler vertical"><span>0</span><span>300</span><span>600</span></div>
          <div class="canvas-stage">
            <canvas ref="stampCanvas" width="600" height="600"></canvas>
            <div
              v-if="showSelectionFrame"
              class="selection-frame"
              :style="selectionFrameStyle"
            >
              <span class="selection-handle handle-tl"></span>
              <span class="selection-handle handle-tr"></span>
              <span class="selection-handle handle-br"></span>
              <span class="selection-handle handle-bl"></span>
              <span class="selection-center-dot"></span>
            </div>
          </div>
        </div>
        <div class="canvas-footer">
          <input
            ref="templateFileInput"
            type="file"
            accept=".json"
            style="display: none"
            @change="loadTemplateFile"
          />
          <div class="canvas-status">
            <span>{{ selectedElementLabel }}</span>
            <span>{{ canvasMeta }}</span>
          </div>
          <div class="export-dock" aria-label="导出设置">
            <span class="export-dock-title">导出</span>
            <div class="export-scale-mini">
              <button
                v-for="option in scaleOptions"
                :key="option.value"
                type="button"
                :class="{ active: selectedScale === option.value }"
                @click="applyExportScale(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            <label class="white-bg-toggle" title="PNG 使用白色背景">
              <input type="checkbox" v-model="useWhitePngBackground" />
              <span>白底</span>
            </label>
            <input
              v-model="exportFilename"
              class="export-name-mini"
              type="text"
              placeholder="文件名"
              @focus="prepareExportDock"
            />
            <button class="canvas-action-btn primary" @click="quickExportFromDock" title="按当前导出设置下载">
              <span>↧</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧：属性编辑器 -->
      <PropertiesPanel
        v-if="isDrawStampUtilsReady"
        ref="propertiesPanelRef"
        :drawStampUtils="drawStampUtils"
        :selectedElement="selectedElement"
        :elementType="selectedElementType"
        :elementIndex="selectedElementIndex"
        @updateDrawStamp="updateDrawStamp"
        @clearSelection="clearSelectedElement"
      />
      <div v-else class="right-panel-loading">
        <div class="loading-spinner"></div>
        <span>{{ t('common.loading') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { DrawStampUtils } from '../../DrawStampUtils'
import { InitDrawStampConfigsUtils } from '../../utils/InitDrawStampConfigsUtils'
import { ensureStampFontsLoaded, getFontCssFamily, getSystemFonts } from '../../utils/fontUtils'
import { IDrawStampConfig, IDrawImage } from '../../DrawStampTypes'
import ElementList from './ElementList.vue'
import PropertiesPanel from './PropertiesPanel.vue'
import StampExtractor from './StampExtractor.vue'
import { useStampStore } from '../../stores/stampStore'
import type { ExtractStampResult } from '../../utils/extractStampImage'

const props = defineProps<{
  /** 传入的印章模板配置，用于初始化或联动 */
  modelValue?: IDrawStampConfig | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: IDrawStampConfig): void
  (e: 'selectElement', payload: { id: string; type: string; index: number }): void
}>()

const { t } = useI18n()
const stampStore = useStampStore()

// 控制内部逻辑是否已就绪
const isDrawStampUtilsReady = ref(false)
const propertiesPanelRef = ref<InstanceType<typeof PropertiesPanel> | null>(null)
const elementListRef = ref<any | null>(null)

// 选中的元素
const selectedElement = ref<string>('')
const selectedElementType = ref<string>('')
const selectedElementIndex = ref<number>(-1)

// 处理元素选择（对外联动）
const handleSelectElement = (elementId: string, elementType: string, index: number) => {
  selectedElement.value = elementId
  selectedElementType.value = elementType
  selectedElementIndex.value = index
  emit('selectElement', { id: elementId, type: elementType, index })
}

const clearSelectedElement = () => {
  selectedElement.value = ''
  selectedElementType.value = ''
  selectedElementIndex.value = -1
  elementListRef.value?.clearSelection?.()
  emit('selectElement', { id: '', type: '', index: -1 })
}

// 处理元素列表配置更新
const handleElementListUpdate = () => {
  // 配置已通过 stampStore 更新，这里触发重新绘制
  drawStamp()
}

// 处理元素列表刷新
const handleElementListRefresh = () => {
  // 刷新绘制
  drawStamp()
}

const stampCanvas = ref<any | null>(null)
const templateFileInput = ref<HTMLInputElement | null>(null)
const MM_PER_PIXEL = 10 // 毫米换算像素
// 绘制工具
let drawStampUtils: DrawStampUtils
const isDraggable = ref(true) // 是否开启拖动
const showFormatDialog = ref(false)
const showExtractorDialog = ref(false)
const selectedFormat = ref<'png' | 'jpeg' | 'svg'>('png')
const jpegQuality = ref(92)
const MIN_EXPORT_SIZE = 100
const MAX_EXPORT_SIZE = 4096
const defaultExportWidth = ref(0)
const defaultExportHeight = ref(0)
const exportWidth = ref(0)
const exportHeight = ref(0)
const selectedScale = ref<1 | 2 | 3 | 4>(1)
const useWhitePngBackground = ref(false)
const exportFilename = ref('')
const selectedRatio = ref<'original' | 'square' | '4:3' | '16:9' | 'custom'>('original')
const viewScalePercent = ref(100)
const canvasViewRevision = ref(0)
const canvasBackgroundMode = ref<'grid' | 'paper' | 'checker'>('grid')

// 导出模板元信息弹窗状态
const showTemplateMetaDialog = ref(false)
const templateTitle = ref('')
const templateCategories = ref('')
const pendingTemplateConfig = ref<IDrawStampConfig | null>(null)

const exportFormats = computed(() => [
  { value: 'png' as const, name: 'PNG', icon: '🖼️', desc: t('stamp.exportFormat.pngDesc') },
  { value: 'jpeg' as const, name: 'JPEG', icon: '📷', desc: t('stamp.exportFormat.jpegDesc') },
  { value: 'svg' as const, name: 'SVG', icon: '📐', desc: t('stamp.exportFormat.svgDesc') }
])

const canvasMeta = computed(() => {
  const config = stampStore.state.config
  const width = Math.round(Number(config?.width) || 40)
  const height = Math.round(Number(config?.height) || 40)
  return `${width} x ${height} mm`
})

const selectedElementLabel = computed(() => {
  if (!selectedElementType.value) return '已选中：基础设置'
  const typeMap: Record<string, string> = {
    basic: '基础设置',
    company: '公司文字',
    stampType: '印章类型',
    code: '编码',
    taxNumber: '税号',
    star: '中心图形',
    circle: '内圆',
    image: '图片',
    svg: 'SVG 图形',
    aging: '做旧效果',
    roughEdge: '毛边效果',
    security: '防伪纹路',
    line: '线条'
  }
  const label = typeMap[selectedElementType.value] || '元素'
  return `已选中：${label}${selectedElementIndex.value > 0 ? ` ${selectedElementIndex.value + 1}` : ''}`
})

const showSelectionFrame = computed(() => {
  return Boolean(selectedElementType.value && stampStore.state.config)
})

const selectionFrameStyle = computed(() => {
  if (!stampStore.state.config || !drawStampUtils) return {}
  canvasViewRevision.value
  const frame = drawStampUtils.getStampViewportFrame()
  const canvasEl = stampCanvas.value
  const canvasScaleX = canvasEl ? canvasEl.getBoundingClientRect().width / canvasEl.width : 1
  const canvasScaleY = canvasEl ? canvasEl.getBoundingClientRect().height / canvasEl.height : 1
  const canvasOffsetLeft = canvasEl?.offsetLeft ?? 20
  const canvasOffsetTop = canvasEl?.offsetTop ?? 20
  const width = Math.max(24, frame.width * canvasScaleX)
  const height = Math.max(24, frame.height * canvasScaleY)

  return {
    left: `${canvasOffsetLeft + frame.left * canvasScaleX}px`,
    top: `${canvasOffsetTop + frame.top * canvasScaleY}px`,
    width: `${width}px`,
    height: `${height}px`
  }
})

const ratioOptions = computed(() => [
  { value: 'original' as const, label: t('stamp.exportFormat.ratioOriginal') },
  { value: 'square' as const, label: t('stamp.exportFormat.ratioSquare') },
  { value: '4:3' as const, label: '4 : 3' },
  { value: '16:9' as const, label: '16 : 9' },
  { value: 'custom' as const, label: t('stamp.exportFormat.ratioCustom') }
])

const scaleOptions = [
  { value: 1 as const, label: '1x' },
  { value: 2 as const, label: '2x' },
  { value: 3 as const, label: '3x' },
  { value: 4 as const, label: '4x' }
]

const canvasBackgroundOptions = [
  { value: 'grid' as const, label: '淡网格背景', icon: '▦' },
  { value: 'paper' as const, label: '纸张白底', icon: '□' },
  { value: 'checker' as const, label: '透明棋盘格', icon: '▧' }
]

const templatePresets = [
  { key: 'contract' as const, name: '合同专用章', desc: '圆章 · 公司名 · 五角星', mark: '合', badge: '常用' },
  { key: 'finance' as const, name: '财务专用章', desc: '椭圆章 · 内圈 · 编码', mark: '财', badge: '财务' },
  { key: 'invoice' as const, name: '发票专用章', desc: '椭圆章 · 税号 · 编码', mark: '票', badge: '税务' },
  { key: 'clean' as const, name: '干净空白章', desc: '重置为清爽基础版', mark: '新', badge: '空白' }
]

type TemplatePresetKey = typeof templatePresets[number]['key']
const activeTemplatePreset = ref<TemplatePresetKey>('contract')
const isTemplatePickerOpen = ref(false)
const activeTemplatePresetInfo = computed(() => {
  return templatePresets.find((preset) => preset.key === activeTemplatePreset.value) || templatePresets[0]
})

const getRatioValue = (ratio: 'original' | 'square' | '4:3' | '16:9'): number => {
  if (ratio === 'square') return 1
  if (ratio === '4:3') return 4 / 3
  if (ratio === '16:9') return 16 / 9
  const baseWidth = Math.max(defaultExportWidth.value || MIN_EXPORT_SIZE, MIN_EXPORT_SIZE)
  const baseHeight = Math.max(defaultExportHeight.value || MIN_EXPORT_SIZE, MIN_EXPORT_SIZE)
  return baseWidth / baseHeight
}

const clampExportSize = (value: number, fallback: number) => {
  if (!value || Number.isNaN(value)) return fallback
  return Math.min(Math.max(value, MIN_EXPORT_SIZE), MAX_EXPORT_SIZE)
}

const applyRatio = (ratio: 'original' | 'square' | '4:3' | '16:9' | 'custom') => {
  selectedRatio.value = ratio
  if (ratio === 'custom') {
    return
  }
  const baseWidth = clampExportSize(defaultExportWidth.value, MIN_EXPORT_SIZE)
  const ratioValue = getRatioValue(ratio)
  exportWidth.value = Math.round(baseWidth)
  exportHeight.value = Math.round(baseWidth / ratioValue)
  exportHeight.value = clampExportSize(exportHeight.value, MIN_EXPORT_SIZE)
}

const resetExportSize = () => {
  selectedScale.value = 1
  applyRatio('original')
}

const applyExportScale = (scale: 1 | 2 | 3 | 4) => {
  if (!defaultExportWidth.value || !defaultExportHeight.value) {
    refreshExportDefaults()
  }
  selectedScale.value = scale
  const baseWidth = clampExportSize(defaultExportWidth.value, MIN_EXPORT_SIZE)
  const baseHeight = clampExportSize(defaultExportHeight.value, MIN_EXPORT_SIZE)
  exportWidth.value = clampExportSize(Math.round(baseWidth * scale), baseWidth)
  exportHeight.value = clampExportSize(Math.round(baseHeight * scale), baseHeight)
  selectedRatio.value = 'original'
}

const refreshExportDefaults = () => {
  if (!drawStampUtils) return
  const baseSize = drawStampUtils.getExportBaseSize()
  defaultExportWidth.value = Math.round(baseSize.width)
  defaultExportHeight.value = Math.round(baseSize.height)
  exportWidth.value = clampExportSize(Math.round(defaultExportWidth.value * selectedScale.value), defaultExportWidth.value)
  exportHeight.value = clampExportSize(Math.round(defaultExportHeight.value * selectedScale.value), defaultExportHeight.value)
  if (!exportFilename.value) {
    exportFilename.value = buildExportFilename(drawStampUtils.getDrawConfigs())
  }
}

const prepareExportDock = () => {
  refreshExportDefaults()
}

const quickExportFromDock = () => {
  if (!drawStampUtils) return
  refreshExportDefaults()
  const width = clampExportSize(exportWidth.value, Math.round(defaultExportWidth.value) || MIN_EXPORT_SIZE)
  const height = clampExportSize(exportHeight.value, Math.round(defaultExportHeight.value) || MIN_EXPORT_SIZE)
  drawStampUtils.saveStampAsPNG('png', 0.92, Math.round(width), Math.round(height), {
    filenameBase: exportFilename.value || buildExportFilename(drawStampUtils.getDrawConfigs()),
    background: useWhitePngBackground.value ? 'white' : 'transparent'
  })
}

const handleWidthInput = () => {
  const fallback = Math.round(defaultExportWidth.value) || MIN_EXPORT_SIZE
  exportWidth.value = clampExportSize(exportWidth.value, fallback)
  if (selectedRatio.value !== 'custom') {
    const ratioValue = getRatioValue(selectedRatio.value)
    exportHeight.value = Math.round(exportWidth.value / ratioValue)
    exportHeight.value = clampExportSize(exportHeight.value, Math.round(defaultExportHeight.value) || MIN_EXPORT_SIZE)
  }
}

const handleHeightInput = () => {
  const fallback = Math.round(defaultExportHeight.value) || MIN_EXPORT_SIZE
  exportHeight.value = clampExportSize(exportHeight.value, fallback)
  if (selectedRatio.value !== 'custom') {
    const ratioValue = getRatioValue(selectedRatio.value)
    exportWidth.value = Math.round(exportHeight.value * ratioValue)
    exportWidth.value = clampExportSize(exportWidth.value, Math.round(defaultExportWidth.value) || MIN_EXPORT_SIZE)
  }
}

const getPrimaryCompanyName = (config: IDrawStampConfig) => {
  return (
    config.companyList?.find(item => item.companyName?.trim())?.companyName ||
    config.company?.companyName ||
    '电子印章'
  ).trim()
}

const buildExportFilename = (config: IDrawStampConfig) => {
  const companyName = getPrimaryCompanyName(config)
  const stampType = config.stampTypeList?.find(item => item.stampType?.trim())?.stampType || config.stampType?.stampType || '印章'
  const today = new Date()
  const dateText = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  return `${companyName}_${stampType}_${dateText}`
}

const createPresetConfig = (presetKey: TemplatePresetKey): IDrawStampConfig => {
  const defaultConfig = new InitDrawStampConfigsUtils().initDrawStampConfigs()
  const base = JSON.parse(JSON.stringify(defaultConfig)) as IDrawStampConfig
  const companyBase = base.companyList?.[0] || base.company
  const stampTypeBase = base.stampTypeList?.[0] || base.stampType
  const codeBase = base.stampCodeList?.[0] || base.stampCode

  base.primaryColor = '#c91523'
  base.borderWidth = 1
  base.scale = 1
  base.offsetX = 0
  base.offsetY = 0
  base.ruler.showRuler = true
  base.ruler.showFullRuler = true
  base.ruler.showSideRuler = true
  base.ruler.showCrossLine = true
  base.ruler.showDashLine = true
  base.ruler.showCurrentPositionText = true
  base.agingEffect.applyAging = false
  base.roughEdge.drawRoughEdge = false
  base.securityPattern.openSecurityPattern = false
  base.imageList = []
  base.svgList = []
  base.lineList = []
  base.innerCircleList = []
  base.openManualAging = false
  base.taxNumber.code = ''
  base.stampCode = { ...codeBase, code: '', color: base.primaryColor }
  base.stampCodeList = []

  const companyName = getPrimaryCompanyName(base).includes('印章') ? '示例科技有限公司' : getPrimaryCompanyName(base)
  const commonCompany = {
    ...companyBase,
    companyName,
    shape: 'ellipse' as const,
    fontFamily: 'SimSun',
    fontHeight: 4.2,
    fontWeight: 'normal' as const,
    color: base.primaryColor,
    borderOffset: 1,
    textDistributionFactor: 3,
    adjustEllipseText: true,
    startAngle: 0,
    rotateDirection: 'counterclockwise' as const
  }

  if (presetKey === 'clean') {
    base.title = '干净空白章'
    base.width = 40
    base.height = 40
    base.company = { ...commonCompany, companyName: '示例科技有限公司' }
    base.companyList = [base.company]
    base.stampType = { ...stampTypeBase, stampType: '专用章', positionY: -3, fontHeight: 4.5, color: base.primaryColor }
    base.stampTypeList = [base.stampType]
    base.drawStar = { ...base.drawStar, drawStar: false, color: base.primaryColor, starPositionX: 0, starPositionY: 0 }
    return base
  }

  if (presetKey === 'contract') {
    base.title = '合同专用章'
    base.width = 42
    base.height = 42
    base.company = commonCompany
    base.companyList = [commonCompany]
    base.stampType = {
      ...stampTypeBase,
      stampType: '合同专用章',
      fontHeight: 4.4,
      fontFamily: 'SimSun',
      fontWeight: 'bold',
      positionX: 0,
      positionY: -7,
      fontWidth: 3,
      color: base.primaryColor
    }
    base.stampTypeList = [base.stampType]
    base.drawStar = { ...base.drawStar, drawStar: true, starDiameter: 11, starPositionX: 0, starPositionY: 0, color: base.primaryColor }
    base.innerCircleList = [{
      ...base.innerCircle,
      drawInnerCircle: true,
      innerCircleLineWidth: 0.35,
      innerCircleLineRadiusX: 13,
      innerCircleLineRadiusY: 13,
      color: base.primaryColor,
      shape: 'ellipse'
    }]
    return base
  }

  if (presetKey === 'finance') {
    base.title = '财务专用章'
    base.width = 46
    base.height = 32
    base.company = { ...commonCompany, fontHeight: 3.9, textDistributionFactor: 3.8 }
    base.companyList = [base.company]
    base.stampType = {
      ...stampTypeBase,
      stampType: '财务专用章',
      fontHeight: 4,
      fontFamily: 'SimSun',
      fontWeight: 'bold',
      positionY: -4,
      color: base.primaryColor
    }
    base.stampTypeList = [base.stampType]
    base.stampCode = {
      ...codeBase,
      code: 'NO.000001',
      fontHeight: 1.3,
      borderOffset: 1.2,
      color: base.primaryColor
    }
    base.stampCodeList = [base.stampCode]
    base.innerCircleList = [{
      ...base.innerCircle,
      drawInnerCircle: true,
      innerCircleLineWidth: 0.28,
      innerCircleLineRadiusX: 14,
      innerCircleLineRadiusY: 9,
      color: base.primaryColor,
      shape: 'ellipse'
    }]
    base.drawStar = { ...base.drawStar, drawStar: false, color: base.primaryColor }
    return base
  }

  base.title = '发票专用章'
  base.width = 48
  base.height = 34
  base.company = { ...commonCompany, fontHeight: 3.8, textDistributionFactor: 4 }
  base.companyList = [base.company]
  base.stampType = {
    ...stampTypeBase,
    stampType: '发票专用章',
    fontHeight: 4.2,
    fontFamily: 'SimSun',
    fontWeight: 'bold',
    positionY: -4,
    color: base.primaryColor
  }
  base.stampTypeList = [base.stampType]
  base.taxNumber = {
    ...base.taxNumber,
    code: '税号 000000000000000000',
    fontHeight: 2,
    positionY: 8,
    totalWidth: 32,
    color: base.primaryColor
  }
  base.stampCode = {
    ...codeBase,
    code: '发票专用',
    fontHeight: 1.2,
    color: base.primaryColor
  }
  base.stampCodeList = [base.stampCode]
  base.innerCircleList = [{
    ...base.innerCircle,
    drawInnerCircle: true,
    innerCircleLineWidth: 0.25,
    innerCircleLineRadiusX: 15,
    innerCircleLineRadiusY: 9.8,
    color: base.primaryColor,
    shape: 'ellipse'
  }]
  base.drawStar = { ...base.drawStar, drawStar: false, color: base.primaryColor }
  return base
}

// 标记当前是否为父组件驱动的配置同步，避免 v-model 循环更新
let isUpdatingFromParent = false

// 获取所有文字路径（公司名称、编码和印章类型）
let allTextPaths: any[] = []
let companyTextPaths: any[] = []
let codeTextPaths: any[] = []
let stampTypeTextPaths: any[] = []
let taxNumberTextPaths: any[] = []

const updateViewState = () => {
  if (!drawStampUtils) return
  const view = drawStampUtils.getViewState()
  viewScalePercent.value = Math.round(view.scale * 100)
  canvasViewRevision.value += 1
}

const zoomCanvas = (factor: number) => {
  if (!drawStampUtils) return
  drawStampUtils.zoomBy(factor)
  updateViewState()
}

const fitCanvasToView = () => {
  if (!drawStampUtils) return
  drawStampUtils.fitToView()
  updateViewState()
}

const resetCanvasView = () => {
  if (!drawStampUtils) return
  drawStampUtils.resetZoom()
  updateViewState()
}

// 初始化绘制印章参数
const initDrawStampUtils = () => {
  drawStampUtils = new DrawStampUtils(stampCanvas.value, MM_PER_PIXEL)
  drawStampUtils.setOnConfigChange((config) => {
    stampStore.setConfig(JSON.parse(JSON.stringify(config)) as IDrawStampConfig)
    syncConfigToParent()
    updateViewState()
  })

  // 如果父组件传入了模板配置，优先使用该配置初始化
  if (props.modelValue) {
    const initialConfig = JSON.parse(JSON.stringify(props.modelValue)) as IDrawStampConfig
    drawStampUtils.setDrawConfigs(initialConfig)
    stampStore.setConfig(initialConfig)
  } else {
    stampStore.setConfig(drawStampUtils.getDrawConfigs())
  }
}

const syncConfigToParent = () => {
  if (!drawStampUtils || isUpdatingFromParent) return
  const currentConfig = drawStampUtils.getDrawConfigs()
  emit('update:modelValue', currentConfig)
}

const drawStamp = (refreshSecurityPattern: boolean = false, refreshOld: boolean = false, refreshRoughEdge: boolean = false) => {
  // 使用 drawStampUtils 进行绘制
  drawStampUtils.refreshStamp(refreshSecurityPattern, refreshOld, refreshRoughEdge)

  // 确保拖动设置与当前状态一致
  drawStampUtils.setDraggable(isDraggable.value)
  stampStore.setConfig(drawStampUtils.getDrawConfigs())
  syncConfigToParent()
  updateViewState()

  // 更新文字路径
  companyTextPaths = drawStampUtils.drawCompanyUtils.getTextPaths()
  codeTextPaths = drawStampUtils.drawCodeUtils.getTextPaths()
  stampTypeTextPaths = drawStampUtils.drawStampTypeUtils.getTextPaths()
  taxNumberTextPaths = drawStampUtils.drawTaxNumberUtils.getTextPaths()
  allTextPaths = [...companyTextPaths, ...codeTextPaths, ...stampTypeTextPaths, ...taxNumberTextPaths]
}

// 触发文件选择
const triggerTemplateFileLoad = () => {
  templateFileInput.value?.click()
}

// 加载模板文件
const loadTemplateFile = async (event: Event) => {
  const inputEl = event.target as HTMLInputElement
  if (!inputEl.files?.length || !drawStampUtils) return

  try {
    const file = inputEl.files[0]
    const text = await file.text()
    const config = JSON.parse(text) as IDrawStampConfig

    // 设置新的配置
    const newConfig = JSON.parse(JSON.stringify(config)) as IDrawStampConfig
    newConfig.ruler.showRuler = true
    newConfig.ruler.showFullRuler = true
    newConfig.ruler.showSideRuler = true
    newConfig.ruler.showCrossLine = true
    newConfig.ruler.showCurrentPositionText = true
    newConfig.ruler.showDashLine = true

    if (config.company) {
      newConfig.company.startAngle = config.company.startAngle
      newConfig.company.rotateDirection = config.company.rotateDirection
    }

    if (!newConfig.svgList) {
      newConfig.svgList = []
    }

    drawStampUtils.setDrawConfigs(newConfig)
    stampStore.setConfig(newConfig)
    syncConfigToParent()
    drawStamp()

    // 更新编辑器控件
    await nextTick()
    propertiesPanelRef.value?.restoreDrawConfigs()
  } catch (error) {
    console.error(t('errors.loadTemplateFailed') + ':', error)
    alert(t('errors.loadTemplateFailed'))
  } finally {
    // 清除文件选择，以便可以再次选择同一个文件
    inputEl.value = ''
  }
}

// 保存图片（本地下载，无后端限制）
const saveStampAsPNG = () => {
  if (!drawStampUtils) return
  const baseSize = drawStampUtils.getExportBaseSize()
  defaultExportWidth.value = Math.round(baseSize.width)
  defaultExportHeight.value = Math.round(baseSize.height)
  resetExportSize()
  selectedFormat.value = 'png'
  jpegQuality.value = 92
  useWhitePngBackground.value = false
  exportFilename.value = buildExportFilename(drawStampUtils.getDrawConfigs())

  showFormatDialog.value = true
}

const closeFormatDialog = () => {
  showFormatDialog.value = false
}

const confirmExport = async () => {
  closeFormatDialog()

  if (!drawStampUtils) return
  const width = clampExportSize(exportWidth.value, Math.round(defaultExportWidth.value) || MIN_EXPORT_SIZE)
  const height = clampExportSize(exportHeight.value, Math.round(defaultExportHeight.value) || MIN_EXPORT_SIZE)
  const quality = selectedFormat.value === 'jpeg' ? jpegQuality.value / 100 : 0.92

  // 执行下载
  drawStampUtils.saveStampAsPNG(selectedFormat.value, quality, Math.round(width), Math.round(height), {
    filenameBase: exportFilename.value || buildExportFilename(drawStampUtils.getDrawConfigs()),
    background: selectedFormat.value === 'png' && useWhitePngBackground.value ? 'white' : 'transparent'
  })
}

const applyTemplatePreset = async (presetKey: TemplatePresetKey) => {
  if (!drawStampUtils) return
  activeTemplatePreset.value = presetKey
  const presetConfig = createPresetConfig(presetKey)
  drawStampUtils.setDrawConfigs(presetConfig)
  drawStampUtils.resetZoom()
  stampStore.setConfig(presetConfig)
  syncConfigToParent()
  exportFilename.value = buildExportFilename(presetConfig)
  selectedElement.value = ''
  selectedElementType.value = ''
  selectedElementIndex.value = -1
  drawStamp()

  await nextTick()
  propertiesPanelRef.value?.restoreDrawConfigs()
  handleSelectElement('basic-settings', 'basic', 0)
}

const resetStamp = () => {
  if (!drawStampUtils) return
  const blankConfig = JSON.parse(JSON.stringify(drawStampUtils.getDrawConfigs())) as IDrawStampConfig
  blankConfig.companyList = []
  blankConfig.company.companyName = ''
  blankConfig.stampTypeList = []
  blankConfig.stampCode.code = ''
  blankConfig.stampCodeList = []
  blankConfig.taxNumber.code = ''
  blankConfig.imageList = []
  blankConfig.lineList = []
  blankConfig.innerCircleList = []
  blankConfig.svgList = []
  blankConfig.drawStar.drawStar = false
  blankConfig.drawStar.starPositionX = 0
  blankConfig.company.shape = 'ellipse'
  if (blankConfig.companyList) {
    blankConfig.companyList.forEach(company => company.shape = 'ellipse')
  }
  blankConfig.securityPattern.openSecurityPattern = false
  blankConfig.roughEdge.drawRoughEdge = false
  blankConfig.agingEffect.applyAging = false
  blankConfig.agingEffect.agingEffectParams = []
  blankConfig.openManualAging = false
  blankConfig.width = 40
  blankConfig.height = 40

  drawStampUtils.setDrawConfigs(blankConfig)
  stampStore.setConfig(blankConfig)
  syncConfigToParent()
  selectedElement.value = ''
  selectedElementType.value = ''
  selectedElementIndex.value = -1
  drawStamp()
  handleSelectElement('basic-settings', 'basic', 0)
}

// 清理未启用的效果数组，减小模板文件大小
const cleanConfigForTemplate = (config: IDrawStampConfig): IDrawStampConfig => {
  const cleanedConfig = JSON.parse(JSON.stringify(config)) as IDrawStampConfig

  // 如果做旧效果未开启，删除做旧参数数组
  if (cleanedConfig.agingEffect && !cleanedConfig.agingEffect.applyAging) {
    (cleanedConfig.agingEffect as any).agingEffectParams = undefined
  }

  // 如果毛边效果未开启，删除毛边参数数组
  if (cleanedConfig.roughEdge && !cleanedConfig.roughEdge.drawRoughEdge) {
    (cleanedConfig.roughEdge as any).roughEdgeParams = undefined
  }

  // 如果防伪纹路未开启，删除防伪纹路参数数组
  if (cleanedConfig.securityPattern && !cleanedConfig.securityPattern.openSecurityPattern) {
    (cleanedConfig.securityPattern as any).securityPatternParams = undefined
  }

  return cleanedConfig
}

// 导出当前设置为模板（弹出元信息对话框）
const saveCurrentAsTemplate = () => {
  if (!drawStampUtils) return

  const currentConfig = drawStampUtils.getDrawConfigs()
  // 清理未启用的效果数组
  const cleanedConfig = cleanConfigForTemplate(currentConfig)

  // 预填标题
  const defaultTitle =
    cleanedConfig.title ||
    cleanedConfig.stampType?.stampType ||
    cleanedConfig.company?.companyName ||
    ''
  templateTitle.value = defaultTitle

  // 预填分类（多个分类使用空格分隔）
  const defaultCategories = Array.isArray(cleanedConfig.categories)
    ? cleanedConfig.categories.join(' ')
    : cleanedConfig.category || ''
  templateCategories.value = defaultCategories

  pendingTemplateConfig.value = cleanedConfig
  showTemplateMetaDialog.value = true
}

const closeTemplateMetaDialog = () => {
  showTemplateMetaDialog.value = false
  pendingTemplateConfig.value = null
}

const openExtractorDialog = () => {
  showExtractorDialog.value = true
}

const closeExtractorDialog = () => {
  showExtractorDialog.value = false
}

const clearGeneratedStampElements = (config: IDrawStampConfig) => {
  config.companyList = []
  config.company.companyName = ''
  config.stampTypeList = []
  config.stampType.stampType = ''
  config.stampCode.code = ''
  config.stampCodeList = []
  config.taxNumber.code = ''
  config.imageList = []
  config.lineList = []
  config.innerCircleList = []
  config.svgList = []
  config.drawStar.drawStar = false
  config.securityPattern.openSecurityPattern = false
  config.roughEdge.drawRoughEdge = false
  config.agingEffect.applyAging = false
  config.agingEffect.agingEffectParams = []
  config.openManualAging = false
  config.offsetX = 0
  config.offsetY = 0
  config.scale = 1

  if (config.outBorder) {
    config.outBorder.drawInnerCircle = false
  }
  if (config.innerCircle) {
    config.innerCircle.drawInnerCircle = false
  }
  if (config.outThinCircle) {
    config.outThinCircle.drawInnerCircle = false
  }
}

const handleExtractedStampImage = async (payload: ExtractStampResult) => {
  if (!drawStampUtils) return

  const currentConfig = drawStampUtils.getDrawConfigs()
  clearGeneratedStampElements(currentConfig)

  const aspectRatio = payload.width / Math.max(payload.height, 1)
  const isRoundCanvas = Math.abs(Number(currentConfig.width) - Number(currentConfig.height)) <= 2
  const fillRatio = isRoundCanvas ? 0.78 : 0.74
  const maxWidth = Math.max(8, currentConfig.width * fillRatio)
  const maxHeight = Math.max(8, currentConfig.height * fillRatio)
  let imageWidth = maxWidth
  let imageHeight = imageWidth / aspectRatio

  if (imageHeight > maxHeight) {
    imageHeight = maxHeight
    imageWidth = imageHeight * aspectRatio
  }

  const imageItem: IDrawImage = {
    imageUrl: payload.dataUrl,
    imageWidth: Number(imageWidth.toFixed(1)),
    imageHeight: Number(imageHeight.toFixed(1)),
    positionX: 0,
    positionY: 0,
    keepAspectRatio: true,
    rotation: 0
  }

  currentConfig.imageList = [imageItem]
  const newIndex = currentConfig.imageList.length - 1

  drawStampUtils.setDrawConfigs(currentConfig)
  stampStore.setConfig(currentConfig)
  syncConfigToParent()
  drawStamp()

  await nextTick()
  handleSelectElement(`image-${newIndex}`, 'image', newIndex)
}

const confirmSaveTemplate = () => {
  if (!pendingTemplateConfig.value) {
    closeTemplateMetaDialog()
    return
  }

  const config = pendingTemplateConfig.value

  const title = templateTitle.value.trim()
  if (title) {
    config.title = title
  }

  const categoriesInput = templateCategories.value.trim()
  if (categoriesInput) {
    const parts = categoriesInput.split(/\s+/).filter(Boolean)
    if (parts.length > 0) {
      config.category = parts[0]
      config.categories = parts
    }
  }

  // 使用紧凑格式（无缩进和换行）来减小文件大小，并排除 undefined 字段
  const jsonStr = JSON.stringify(config, (_key, value) => {
    // JSON.stringify 会自动排除 undefined 值，所以直接返回 value 即可
    return value
  })
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const safeTitle = (config.title && config.title.trim()) || 'stamp_template'
  // 将中文标题中的空格替换为下划线，避免文件名问题
  const fileName = `${safeTitle.replace(/\s+/g, '_')}.json`
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  closeTemplateMetaDialog()
}

// 更新印章绘制，从 PropertiesPanel 组件中调用
const updateDrawStamp = (newConfig: IDrawStampConfig, refreshSecurityPattern: boolean, refreshOld: boolean, refreshRoughEdge: boolean) => {
  drawStampUtils.setDrawConfigs(newConfig)
  drawStampUtils.refreshStamp(refreshSecurityPattern, refreshOld, refreshRoughEdge)
  stampStore.setConfig(newConfig)
  syncConfigToParent()
}

// 修改字体预览更新函数
const updateFontPreview = (event: Event) => {
  const element = event.target as HTMLElement
  const fontFamily = element.tagName === 'SELECT'
    ? (element as HTMLSelectElement).value
    : (element as HTMLInputElement).value

  element.style.setProperty('--current-font', getFontCssFamily(fontFamily))

  // 如果是 select 变化，同步更新 input
  if (element.tagName === 'SELECT') {
    const inputEl = element.parentElement?.querySelector('.font-input') as HTMLInputElement
    if (inputEl) {
      inputEl.value = fontFamily
      inputEl.style.setProperty('--current-font', getFontCssFamily(fontFamily))
    }
  }

  // 如果 input 变化，同步更新 select
  if (element.tagName === 'INPUT') {
    const selectEl = element.parentElement?.querySelector('.font-select') as HTMLSelectElement
    if (selectEl) {
      selectEl.value = fontFamily
      selectEl.style.setProperty('--current-font', getFontCssFamily(fontFamily))
    }
  }
}

// 添加鼠标移动检测
const handleMouseMove = (event: MouseEvent) => {
  if (!drawStampUtils?.canvas) return

  const rect = drawStampUtils.canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // 检查是否悬停在文字上
  let isOverText = false
  for (const textPath of allTextPaths) {
    if (x >= textPath.bounds.x &&
        x <= textPath.bounds.x + textPath.bounds.width &&
        y >= textPath.bounds.y &&
        y <= textPath.bounds.y + textPath.bounds.height) {
      isOverText = true
      drawStampUtils.canvas.style.cursor = 'pointer'
      return
    }
  }

  if (!isOverText) {
    drawStampUtils.canvas.style.cursor = isDraggable.value ? 'move' : 'default'
  }
}

// 添加点击事件处理
const handleCanvasClick = (event: MouseEvent) => {
  if (!drawStampUtils?.canvas) return

  const rect = drawStampUtils.canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // 检查点击的文字
  for (const textPath of allTextPaths) {
    if (x >= textPath.bounds.x &&
        x <= textPath.bounds.x + textPath.bounds.width &&
        y >= textPath.bounds.y &&
        y <= textPath.bounds.y + textPath.bounds.height) {
      // 可以在这里添加点击文字的处理逻辑
      return
    }
  }
}

// 父组件如果更新了传入的模板配置，这里做一次同步
watch(
  () => props.modelValue,
  (newVal) => {
    if (!drawStampUtils || !newVal) return
    const cloned = JSON.parse(JSON.stringify(newVal)) as IDrawStampConfig
    isUpdatingFromParent = true
    try {
      drawStampUtils.setDrawConfigs(cloned)
      stampStore.setConfig(cloned)
      // 这里仅刷新画面，但不会通过 syncConfigToParent 再次向父组件回推，避免递归
      drawStamp(false, false, false)
    } finally {
      isUpdatingFromParent = false
    }
  }
)

// 在组件挂载时初始化
onMounted(async () => {
  initDrawStampUtils()
  await getSystemFonts()
  await ensureStampFontsLoaded()

  // 设置初始拖动状态
  drawStampUtils.setDraggable(isDraggable.value)
  if (stampCanvas.value) {
    stampCanvas.value.style.cursor = isDraggable.value ? 'move' : 'default'
  }

  drawStamp()
  // 初始化所有字体选择器的预览
  document.querySelectorAll('.font-select, .font-input').forEach((element) => {
    if (element instanceof HTMLElement) {
      updateFontPreview({ target: element } as unknown as Event)
    }
  })
  isDrawStampUtilsReady.value = true

  // 默认选中基础设置
  await nextTick()
  handleSelectElement('basic-settings', 'basic', 0)

  window.addEventListener('mousemove', handleMouseMove)
  drawStampUtils?.canvas?.addEventListener('click', handleCanvasClick)
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  drawStampUtils?.canvas?.removeEventListener('click', handleCanvasClick)
})
</script>

<style scoped>
/* 主工作区：三栏布局 */
.main-workspace {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  background: #f6f7f9;
  border: 1px solid #d9dee7;
  border-radius: 10px;
  height: calc(100vh - 48px);
  min-height: calc(100vh - 48px);
  overflow: hidden;
  box-shadow: 0 18px 55px rgba(35, 45, 66, 0.13);
}

.top-toolbar {
  min-height: 72px;
  padding: 12px 16px;
  border-bottom: 1px solid #d9dee7;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.toolbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
  text-align: left;
}

.toolbar-brand h1,
.toolbar-kicker {
  margin: 0;
}

.toolbar-brand h1 {
  color: #202733;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 700;
}

.toolbar-kicker {
  color: #7a8495;
  font-size: 11px;
  line-height: 1.4;
  text-transform: uppercase;
}

.toolbar-status {
  border: 1px solid #cfd7e4;
  border-radius: 999px;
  color: #42607f;
  background: #f4f8fb;
  font-size: 12px;
  padding: 4px 9px;
  white-space: nowrap;
}

.toolbar-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  min-width: 220px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 7px 11px;
  border-radius: 7px;
  border: 1px solid #d9dee7;
  background: #fbfcfd;
  cursor: pointer;
  font-size: 13px;
  color: #303b4b;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.toolbar-btn:hover {
  background: #eef5fb;
  border-color: #a9bfd8;
  color: #17324f;
  transform: translateY(-1px);
}

.toolbar-btn.compact {
  background: #ffffff;
}

.toolbar-btn.primary {
  border-color: #bd2431;
  background: #bd2431;
  color: #ffffff;
}

.toolbar-btn.primary:hover {
  background: #9f1e29;
  border-color: #9f1e29;
  color: #ffffff;
}

.toolbar-icon {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #edf2f7;
  color: #47566a;
  font-size: 12px;
  line-height: 1;
  font-weight: 700;
}

.toolbar-btn.primary .toolbar-icon {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.toolbar-label {
  white-space: nowrap;
}

.workspace-left {
  width: 304px;
  min-width: 304px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #ffffff;
  border-right: 1px solid #d9dee7;
}

.template-library {
  flex: 0 0 auto;
  padding: 14px;
  border-bottom: 1px solid #e6eaf0;
  background: #fbfcfd;
}

.library-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  text-align: left;
}

.library-header h2,
.panel-eyebrow {
  margin: 0;
}

.library-header h2 {
  color: #202733;
  font-size: 15px;
  line-height: 1.3;
  font-weight: 700;
}

.panel-eyebrow {
  display: block;
  color: #7a8495;
  font-size: 10px;
  line-height: 1.4;
  letter-spacing: 0;
  text-transform: uppercase;
}

.library-link {
  min-height: 30px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #d9dee7;
  background: #ffffff;
  color: #47566a;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.library-link:hover {
  background: #f6eef0;
  border-color: #bd2431;
  color: #bd2431;
}

.template-picker {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.template-current,
.template-option {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #dbe2ec;
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.98));
  color: #303b4b;
  text-align: left;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.template-current {
  width: 100%;
  min-height: 72px;
  padding: 9px 10px;
}

.template-current::after,
.template-option::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

.template-current:hover,
.template-option:hover {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(253, 248, 249, 0.98));
  border-color: #d69ca4;
  box-shadow: 0 10px 22px rgba(37, 48, 68, 0.09);
  transform: translateY(-1px);
}

.template-current.open,
.template-option.active {
  border-color: #bd2431;
  box-shadow: 0 0 0 2px rgba(189, 36, 49, 0.08), 0 10px 22px rgba(37, 48, 68, 0.09);
}

.template-chevron {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #f2f5f9;
  color: #697586;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  font-size: 16px;
  line-height: 1;
  transform: translateY(-1px);
  transition: transform 0.2s, background 0.2s, color 0.2s;
}

.template-current.open .template-chevron {
  background: #f6eef0;
  color: #bd2431;
  transform: rotate(180deg);
}

.template-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 20;
  padding: 6px;
  border: 1px solid #dbe2ec;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 16px 34px rgba(37, 48, 68, 0.16);
}

.template-option {
  width: 100%;
  min-height: 60px;
  padding: 7px 8px;
  border-color: transparent;
  box-shadow: none;
}

.template-option + .template-option {
  margin-top: 4px;
}

.template-option .preset-preview {
  width: 46px;
  height: 44px;
  background-size: 10px 10px;
}

.template-option .preset-stamp {
  width: 31px;
  height: 31px;
}

.template-option.preset-finance .preset-stamp,
.template-option.preset-invoice .preset-stamp {
  width: 35px;
  height: 25px;
}

.preset-preview {
  width: 58px;
  height: 54px;
  border: 1px solid #e1e7ef;
  border-radius: 7px;
  background:
    linear-gradient(#edf1f6 1px, transparent 1px),
    linear-gradient(90deg, #edf1f6 1px, transparent 1px),
    #ffffff;
  background-size: 12px 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
}

.preset-stamp {
  width: 38px;
  height: 38px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #bd2431;
}

.preset-ring {
  position: absolute;
  inset: 2px;
  border: 2px solid currentColor;
  border-radius: 999px;
}

.preset-star {
  position: relative;
  z-index: 1;
  font-size: 14px;
  line-height: 1;
  transform: translateY(-1px);
}

.preset-type {
  position: absolute;
  bottom: 5px;
  z-index: 1;
  font-size: 8px;
  font-weight: 800;
  line-height: 1;
}

.preset-finance .preset-stamp,
.preset-invoice .preset-stamp {
  width: 42px;
  height: 30px;
}

.preset-finance .preset-ring,
.preset-invoice .preset-ring {
  inset: 2px;
  border-radius: 999px / 72%;
}

.preset-finance .preset-star,
.preset-invoice .preset-star {
  display: none;
}

.preset-clean .preset-ring {
  border-style: dashed;
  opacity: 0.55;
}

.preset-clean .preset-star {
  display: none;
}

.preset-copy {
  min-width: 0;
  display: block;
  flex: 1;
}

.preset-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.preset-row em {
  flex: 0 0 auto;
  padding: 2px 5px;
  border-radius: 999px;
  background: #f6eef0;
  color: #bd2431;
  font-size: 10px;
  line-height: 1;
  font-style: normal;
  font-weight: 800;
}

.template-current strong,
.template-current small,
.template-option strong,
.template-option small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-current strong,
.template-option strong {
  font-size: 13px;
  line-height: 1.3;
}

.template-current small,
.template-option small {
  margin-top: 2px;
  color: #7a8495;
  font-size: 12px;
  line-height: 1.3;
}

/* Canvas 区域 */
.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #eef1f5;
  border-right: 1px solid #d9dee7;
  overflow: hidden;
}

.canvas-header {
  min-height: 54px;
  padding: 10px 14px;
  border-bottom: 1px solid #d9dee7;
  background: #ffffff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.canvas-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #202733;
  text-align: left;
}

.canvas-title strong,
.canvas-title span {
  display: block;
}

.canvas-title strong {
  font-size: 14px;
  line-height: 1.3;
}

.canvas-title span {
  color: #7a8495;
  font-size: 12px;
}

.canvas-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #27a76f;
  box-shadow: 0 0 0 4px rgba(39, 167, 111, 0.14);
}

.canvas-tools,
.footer-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.canvas-tabs {
  display: flex;
  gap: 8px;
}

.canvas-tab {
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;
}

.canvas-tab.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(#dde3eb 1px, transparent 1px),
    linear-gradient(90deg, #dde3eb 1px, transparent 1px);
  background-color: #eef1f5;
  background-size: 24px 24px;
  overflow: hidden;
  padding: 24px;
  min-width: 0;
}

.canvas-wrapper.canvas-bg-paper {
  background:
    radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.85), transparent 48%),
    linear-gradient(#edf0f4 1px, transparent 1px),
    linear-gradient(90deg, #edf0f4 1px, transparent 1px);
  background-color: #f3f5f8;
  background-size: auto, 32px 32px, 32px 32px;
}

.canvas-wrapper.canvas-bg-checker {
  background:
    linear-gradient(45deg, #dfe5ec 25%, transparent 25%),
    linear-gradient(-45deg, #dfe5ec 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #dfe5ec 75%),
    linear-gradient(-45deg, transparent 75%, #dfe5ec 75%);
  background-color: #f6f8fb;
  background-position: 0 0, 0 12px, 12px -12px, -12px 0;
  background-size: 24px 24px;
}

.canvas-stage {
  position: relative;
  width: min(640px, calc(100% - 8px));
  height: auto;
  aspect-ratio: 1;
  flex: 0 1 auto;
  border: 1px solid #cad2de;
  background:
    linear-gradient(45deg, #f4f6f8 25%, transparent 25%),
    linear-gradient(-45deg, #f4f6f8 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f4f6f8 75%),
    linear-gradient(-45deg, transparent 75%, #f4f6f8 75%);
  background-color: #ffffff;
  background-size: 22px 22px;
  background-position: 0 0, 0 11px, 11px -11px, -11px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 22px 48px rgba(42, 54, 76, 0.18);
}

.canvas-stage canvas {
  width: calc(100% - 40px);
  height: calc(100% - 40px);
}

.canvas-wrapper.canvas-bg-paper .canvas-stage {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(250, 251, 253, 0.96));
}

.canvas-wrapper.canvas-bg-grid .canvas-stage {
  background:
    linear-gradient(#e7ebf0 1px, transparent 1px),
    linear-gradient(90deg, #e7ebf0 1px, transparent 1px);
  background-color: #ffffff;
  background-size: 24px 24px;
}

.canvas-ruler {
  position: absolute;
  z-index: 1;
  color: #768296;
  font-size: 11px;
  user-select: none;
}

.canvas-ruler.horizontal {
  top: 18px;
  left: 56px;
  right: 56px;
  height: 24px;
  border-bottom: 1px solid rgba(118, 130, 150, 0.35);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.canvas-ruler.vertical {
  top: 56px;
  bottom: 56px;
  left: 18px;
  width: 24px;
  border-right: 1px solid rgba(118, 130, 150, 0.35);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}

.canvas-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 54px;
  padding: 9px 14px;
  border-top: 1px solid #d9dee7;
  background: #ffffff;
  flex-shrink: 0;
}

.canvas-status {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #667386;
  font-size: 12px;
  min-width: 0;
}

.canvas-status span {
  white-space: nowrap;
}

.canvas-status span + span::before {
  content: "";
  display: inline-block;
  width: 1px;
  height: 12px;
  margin-right: 14px;
  vertical-align: -2px;
  background: #d9dee7;
}

.canvas-action-btn {
  width: 30px;
  height: 30px;
  padding: 0;
  border-radius: 6px;
  border: 1px solid #d9dee7;
  background: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #303b4b;
  font-size: 14px;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
}

.canvas-action-btn:hover,
.canvas-action-btn.active {
  background: #eef5fb;
  border-color: #a9bfd8;
  color: #17324f;
  transform: translateY(-1px);
}

.canvas-action-btn.primary {
  border-color: #bd2431;
  background: #bd2431;
  color: #ffffff;
}

.canvas-action-btn.primary:hover {
  border-color: #9f1e29;
  background: #9f1e29;
}

.zoom-indicator {
  min-width: 44px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9dee7;
  border-radius: 6px;
  background: #f8fafc;
  color: #47566a;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.selection-frame {
  position: absolute;
  z-index: 3;
  pointer-events: none;
  border: 1px solid rgba(52, 112, 255, 0.76);
  border-radius: 4px;
  overflow: visible;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.86),
    0 8px 24px rgba(38, 85, 180, 0.12),
    inset 0 0 0 1px rgba(255, 255, 255, 0.68);
}

.selection-frame::before,
.selection-frame::after {
  content: "";
  position: absolute;
  background: rgba(52, 112, 255, 0.28);
}

.selection-frame::before {
  left: 50%;
  top: -6px;
  width: 1px;
  height: calc(100% + 12px);
  transform: translateX(-0.5px);
}

.selection-frame::after {
  left: -6px;
  top: 50%;
  width: calc(100% + 12px);
  height: 1px;
  transform: translateY(-0.5px);
}

.selection-handle {
  position: absolute;
  z-index: 2;
  width: 9px;
  height: 9px;
  border: 1px solid #3470ff;
  border-radius: 50%;
  background: #ffffff;
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.95),
    0 2px 8px rgba(37, 99, 235, 0.24);
}

.handle-tl {
  left: -5px;
  top: -5px;
}

.handle-tr {
  right: -5px;
  top: -5px;
}

.handle-br {
  right: -5px;
  bottom: -5px;
}

.handle-bl {
  left: -5px;
  bottom: -5px;
}

.selection-center-dot {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: 50%;
  width: 7px;
  height: 7px;
  border: 1px solid rgba(52, 112, 255, 0.9);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 0 0 3px rgba(52, 112, 255, 0.08),
    0 1px 4px rgba(37, 99, 235, 0.18);
  transform: translate(-50%, -50%);
}

.export-dock {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border: 1px solid #d9dee7;
  border-radius: 8px;
  background: #f8fafc;
}

.export-dock-title {
  padding: 0 5px;
  color: #667386;
  font-size: 12px;
  font-weight: 700;
}

.export-scale-mini {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #e2e7ef;
}

.export-scale-mini button {
  min-width: 28px;
  height: 24px;
  padding: 0 6px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #667386;
  cursor: pointer;
  font-size: 12px;
}

.export-scale-mini button.active {
  background: #f6eef0;
  color: #bd2431;
  font-weight: 700;
}

.white-bg-toggle {
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 7px;
  border: 1px solid #e2e7ef;
  border-radius: 6px;
  background: #ffffff;
  color: #47566a;
  font-size: 12px;
  white-space: nowrap;
}

.white-bg-toggle input {
  width: 13px;
  height: 13px;
  margin: 0;
}

.export-name-mini {
  width: 140px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid #d9dee7;
  border-radius: 6px;
  background: #ffffff;
  color: #303b4b;
  font-size: 12px;
}

.export-name-mini:focus {
  outline: none;
  border-color: #a9bfd8;
  box-shadow: 0 0 0 3px rgba(80, 121, 164, 0.12);
}

.save-count-small {
  font-size: 12px;
}

.export-quick-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.quick-setting {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-setting label,
.export-checkbox {
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.scale-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.scale-button {
  min-height: 34px;
  border: 1px solid #d9dee7;
  border-radius: 7px;
  background: #ffffff;
  color: #303b4b;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.scale-button:hover,
.scale-button.active {
  border-color: #bd2431;
  background: #fff5f6;
  color: #bd2431;
}

.export-checkbox {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.export-checkbox input {
  accent-color: #bd2431;
}

.export-name-input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid #d9dee7;
  border-radius: 7px;
  color: #202733;
  font-size: 14px;
}

.export-name-input:focus {
  border-color: #bd2431;
  box-shadow: 0 0 0 3px rgba(189, 36, 49, 0.12);
  outline: none;
}

.meta-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.meta-input {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.meta-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
  outline: none;
}

/* 左右侧面板 loading 状态 */
.side-panel-loading,
.right-panel-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #999;
  font-size: 13px;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e0e0e0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.stamp-draw-container {
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 0;
  min-width: 0;
}

.workspace-left :deep(.element-list-panel) {
  width: 100%;
  min-width: 0;
  flex: 1;
  border-right: none;
}

.workspace-left :deep(.panel-header) {
  min-height: 46px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.save-count-small {
  font-size: 12px;
}

@media (max-width: 1180px) {
  .top-toolbar {
    flex-wrap: wrap;
  }

  .toolbar-brand,
  .toolbar-actions {
    min-width: 0;
  }
}

@media (max-width: 900px) {
  .main-workspace {
    flex-direction: column;
    height: auto;
    min-height: auto;
  }

  .stamp-draw-container {
    flex-direction: column;
  }

  .workspace-left {
    width: 100%;
    min-width: 0;
    max-height: 520px;
    border-right: none;
    border-bottom: 1px solid #d9dee7;
  }

  .template-library {
    padding: 12px;
  }

  .template-menu {
    max-height: 276px;
    overflow-y: auto;
  }

  .canvas-area {
    min-height: 520px;
    border-right: none;
  }

  .canvas-wrapper {
    padding: 48px 18px 24px;
  }

  .canvas-stage {
    width: min(640px, calc(100vw - 84px));
    height: min(640px, calc(100vw - 84px));
  }

  .canvas-stage canvas {
    width: 100%;
    height: 100%;
  }

  .canvas-ruler {
    display: none;
  }
}

@media (max-width: 640px) {
  .top-toolbar,
  .canvas-header,
  .canvas-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-actions,
  .footer-actions {
    width: 100%;
  }

  .toolbar-actions .toolbar-btn,
  .footer-actions .canvas-action-btn {
    flex: 1;
  }

  .canvas-status {
    width: 100%;
    justify-content: space-between;
    overflow: hidden;
  }

  .template-current {
    min-height: 66px;
  }
}
</style>
