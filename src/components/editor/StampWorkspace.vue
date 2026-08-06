<template>
  <ExportDialog v-if="exportDock.showFormatDialog" :dock="exportDock" />

  <!-- 导出模板元信息弹窗 -->
  <TemplateMetaDialog
    v-model="showTemplateMetaDialog"
    :default-title="templateDefaultTitle"
    :default-categories="templateDefaultCategories"
    @confirm="confirmSaveTemplate"
    @cancel="closeTemplateMetaDialog"
  />

  <StampExtractor
    v-if="showExtractorDialog"
    :primary-color="stampStore.state.config?.primaryColor || DEFAULT_STAMP_RED"
    @close="closeExtractorDialog"
    @add-image="handleExtractedStampImage"
  />

  <!-- 主内容区域：三栏布局（可复用） -->
  <div class="main-workspace">
    <!-- 错误提示 toast（替代原生 alert） -->
    <Transition name="toast-fade">
      <div v-if="errorToast" class="error-toast" role="alert" aria-live="assertive">
        <span class="error-toast-icon" aria-hidden="true">!</span>
        <span class="error-toast-msg">{{ errorToast }}</span>
        <button type="button" class="error-toast-close" @click="dismissErrorToast" :aria-label="t('homepage.canvas.close')">×</button>
      </div>
    </Transition>
    <!-- 顶部快速工具栏 -->
    <div class="top-toolbar" v-if="isDrawStampUtilsReady">
      <div class="toolbar-brand">
        <img class="toolbar-logo" src="/logo-mark.svg" alt="" aria-hidden="true" />
        <div>
          <p class="toolbar-kicker">DrawStamp Studio</p>
          <h1>{{ t('homepage.canvas.workspace') }}</h1>
        </div>
        <div class="toolbar-status-group" :aria-label="t('homepage.canvas.draftStatus')">
          <span class="toolbar-status">{{ t('homepage.canvas.localEditing') }}</span>
          <div class="draft-menu-wrap">
            <button
              type="button"
              class="toolbar-draft-status"
              :class="localDraft.draftStatusClass"
              @click="localDraft.handleDraftStatusClick"
              :aria-expanded="localDraft.isDraftMenuOpen"
              :title="localDraft.draftSaveState === 'failed' ? t('homepage.canvas.retrySave') : t('homepage.canvas.viewRecentDraft')"
            >
              <span class="draft-status-dot"></span>
              <span>{{ localDraft.draftStatusLabel }}</span>
              <span class="draft-status-chevron">⌄</span>
            </button>
            <div v-if="localDraft.isDraftMenuOpen" class="draft-menu">
              <div class="draft-menu-head">
                <strong>{{ t('homepage.canvas.recentDraft') }}</strong>
                <button
                  v-if="localDraft.draftVersions.length"
                  type="button"
                  @click="localDraft.clearLocalDraft"
                >
                  {{ t('homepage.canvas.clearDraft') }}
                </button>
              </div>
              <div v-if="localDraft.draftVersions.length" class="draft-version-list">
                <button
                  v-for="draft in localDraft.draftVersions"
                  :key="draft.id"
                  type="button"
                  class="draft-version-item"
                  @click="localDraft.restoreDraftVersion(draft.id)"
                >
                  <span>
                    <strong>{{ localDraft.formatDraftTime(draft.savedAt) }}</strong>
                    <small>{{ draft.summary }}</small>
                  </span>
                  <em>{{ t('homepage.canvas.restore') }}</em>
                </button>
              </div>
              <p v-else class="draft-menu-empty">{{ t('homepage.canvas.draftEmptyHint') }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="toolbar-actions">
        <LanguageSwitcher />
        <button class="toolbar-btn compact" type="button" @click="openExtractorDialog" :title="t('homepage.canvas.extractStampTitle')">
          <span class="toolbar-icon">印</span>
          <span class="toolbar-label">{{ t('homepage.canvas.extractStamp') }}</span>
        </button>
        <button class="toolbar-btn compact primary" type="button" @click="exportDock.openExportDialog" :title="t('homepage.canvas.download')">
          <span class="toolbar-icon">↧</span>
          <span class="toolbar-label">{{ t('homepage.canvas.download') }}</span>
        </button>
      </div>
    </div>

    <div class="stamp-draw-container">
      <!-- 左侧：模板与元素资源 -->
      <div class="workspace-left">
        <section class="template-library" v-if="isDrawStampUtilsReady" :aria-label="t('homepage.canvas.commonTemplates')">
          <div class="library-header">
            <div>
              <h2>{{ t('homepage.canvas.commonTemplates') }}</h2>
            </div>
            <div class="library-actions">
              <button class="library-link" type="button" @click="saveCurrentAsTemplate" :title="t('homepage.canvas.exportTemplate')">{{ t('homepage.canvas.saveAsTemplate') }}</button>
              <button class="library-link" type="button" @click="triggerTemplateFileLoad">{{ t('homepage.canvas.importShort') }}</button>
            </div>
          </div>
          <div class="template-picker">
            <button
              type="button"
              class="template-current"
              :class="[`preset-${templates.activeTemplatePresetInfo.key}`, `preset-${templates.activeTemplatePresetInfo.shape}`, { open: templates.isTemplatePickerOpen }]"
              @click="templates.isTemplatePickerOpen = !templates.isTemplatePickerOpen"
              :aria-expanded="templates.isTemplatePickerOpen"
            >
              <span class="preset-preview" aria-hidden="true">
                <span class="preset-stamp">
                  <span class="preset-ring"></span>
                  <span class="preset-star">★</span>
                  <span class="preset-type">{{ templates.activeTemplatePresetInfo.mark }}</span>
                </span>
              </span>
              <span class="preset-copy">
                <span class="preset-row">
                  <strong>{{ templates.activeTemplatePresetInfo.name }}</strong>
                  <em>{{ templates.activeTemplatePresetInfo.badge }}</em>
                </span>
                <small>{{ templates.activeTemplatePresetInfo.desc }}</small>
              </span>
              <span class="template-chevron" aria-hidden="true">⌄</span>
            </button>

            <div v-if="templates.isTemplatePickerOpen" class="template-menu">
              <div class="template-category-tabs" :aria-label="t('studio.editor.templateCategoryAria')">
                <button
                  v-for="category in templates.templatePresetCategories"
                  :key="category.key"
                  type="button"
                  :class="{ active: templates.activeTemplateCategory === category.key }"
                  @click="templates.activeTemplateCategory = category.key"
                >
                  {{ category.label }}
                </button>
              </div>
              <button
                v-for="preset in templates.filteredTemplatePresets"
                :key="preset.key"
                type="button"
                class="template-option"
                :class="[`preset-${preset.key}`, `preset-${preset.shape}`, { active: templates.activeTemplatePreset === preset.key }]"
                @click="applyTemplatePreset(preset.key); templates.isTemplatePickerOpen = false"
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
            <span class="canvas-tool-group" :aria-label="t('homepage.canvas.zoomView')">
              <button class="canvas-action-btn" @click="zoomCanvas(0.9)" :title="t('homepage.canvas.zoomOut')">
                <span>−</span>
              </button>
              <button class="canvas-action-btn" @click="zoomCanvas(1.1)" :title="t('homepage.canvas.zoomIn')">
                <span>＋</span>
              </button>
              <span class="zoom-indicator">{{ viewScalePercent }}%</span>
              <button class="canvas-action-btn" @click="fitCanvasToView" :title="t('homepage.canvas.fitWindow')">
                <span>⌖</span>
              </button>
              <button class="canvas-action-btn" @click="resetCanvasView" :title="t('homepage.canvas.resetView')">
                <span>↺</span>
              </button>
            </span>
            <span class="canvas-tool-group" :aria-label="t('homepage.canvas.backgroundMode')">
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
            </span>
          </div>
        </div>
        <div class="canvas-wrapper" :class="`canvas-bg-${canvasBackgroundMode}`">
          <div class="canvas-ruler horizontal">
            <span>{{ rulerMarks.h[0] }}</span>
            <span>{{ rulerMarks.h[1] }}</span>
            <span>{{ rulerMarks.h[2] }}</span>
          </div>
          <div class="canvas-ruler vertical">
            <span>{{ rulerMarks.v[0] }}</span>
            <span>{{ rulerMarks.v[1] }}</span>
            <span>{{ rulerMarks.v[2] }}</span>
          </div>
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
            <a :href="onlineUrl" target="_blank" rel="noopener noreferrer" :title="t('homepage.canvas.openOnline')">
              v{{ appVersion }}
            </a>
          </div>
          <div class="export-dock" :aria-label="t('homepage.canvas.exportSettings')">
            <span class="export-dock-title">{{ t('homepage.canvas.quickExport') }}</span>
            <div class="export-scale-mini">
              <button
                v-for="option in exportDock.scaleOptions"
                :key="option.value"
                type="button"
                :class="{ active: exportDock.selectedScale === option.value }"
                @click="exportDock.applyExportScale(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            <label class="white-bg-toggle" :title="t('homepage.canvas.whiteBackground')">
              <input type="checkbox" v-model="exportDock.useWhitePngBackground" />
              <span>{{ t('homepage.canvas.whiteBackground') }}</span>
            </label>
            <input
              v-model="exportDock.exportFilename"
              class="export-name-mini"
              type="text"
              :placeholder="t('homepage.canvas.filenamePlaceholder')"
              @focus="exportDock.prepareExportDock"
            />
            <button class="canvas-action-btn primary" @click="exportDock.quickExportFromDock" :title="t('homepage.canvas.quickExportTitle')">
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

    <SeoContent />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { DrawStampUtils } from '../../DrawStampUtils'
import { ensureStampFontsLoaded, getFontCssFamily, getSystemFonts } from '../../utils/fontUtils'
import { IDrawStampConfig, IDrawImage } from '../../DrawStampTypes'
import ElementList from './ElementList.vue'
import PropertiesPanel from './PropertiesPanel.vue'
import StampExtractor from './StampExtractor.vue'
import ExportDialog from './ExportDialog.vue'
import TemplateMetaDialog from './TemplateMetaDialog.vue'
import SeoContent from './SeoContent.vue'
import LanguageSwitcher from '../LanguageSwitcher.vue'
import { useStampStore } from '../../stores/stampStore'
import { useExportDock } from '../../composables/useExportDock'
import { useTemplatePresets, type TemplatePresetKey } from '../../composables/useTemplatePresets'
import { useLocalDraft } from '../../composables/useLocalDraft'
import type { ExtractStampResult } from '../../utils/extractStampImage'
import { DEFAULT_STAMP_RED } from '../../Constants'

const props = defineProps<{
  /** 传入的印章模板配置，用于初始化或联动 */
  modelValue?: IDrawStampConfig | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: IDrawStampConfig): void
  (e: 'selectElement', payload: { id: string; type: string; index: number }): void
}>()

const { t, locale } = useI18n()
const stampStore = useStampStore()
const appVersion = __APP_VERSION__
const onlineUrl = 'https://wosp.cc.cd/'

// 通用错误 toast（替代原生 alert）
const errorToast = ref('')
let errorToastTimer: number | undefined
const showErrorToast = (msg: string) => {
  errorToast.value = msg
  if (errorToastTimer) window.clearTimeout(errorToastTimer)
  errorToastTimer = window.setTimeout(() => {
    errorToast.value = ''
  }, 3500)
}
const dismissErrorToast = () => {
  errorToast.value = ''
  if (errorToastTimer) window.clearTimeout(errorToastTimer)
}

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
  // ElementList 删除/撤销直接改 stampStore.config，需先把 store config 同步到 drawStampUtils 内部，
  // 否则 drawStamp() 会用 utils 旧 config 重绘，再 getDrawConfigs() 写回 store，覆盖删除/撤销结果
  if (stampStore.state.config) {
    drawStampUtils.setDrawConfigs(stampStore.state.config)
  }
  drawStamp()
}

// 处理元素列表刷新
const handleElementListRefresh = () => {
  if (stampStore.state.config) {
    drawStampUtils.setDrawConfigs(stampStore.state.config)
  }
  drawStamp()
}

const stampCanvas = ref<any | null>(null)
const templateFileInput = ref<HTMLInputElement | null>(null)
const MM_PER_PIXEL = 10 // 毫米换算像素
// 绘制工具
let drawStampUtils: DrawStampUtils
const isDraggable = ref(true) // 是否开启拖动
const showExtractorDialog = ref(false)
const viewScalePercent = ref(100)
const canvasViewRevision = ref(0)
const canvasBackgroundMode = ref<'grid' | 'paper' | 'checker'>('grid')

// 导出共享状态（底部快速导出 dock + 导出格式弹窗）
const exportDock = useExportDock(() => drawStampUtils)

// 本地自动草稿
const localDraft = useLocalDraft({
  getConfig: () => stampStore.state.config,
  onRestore: async (config) => {
    drawStampUtils.setDrawConfigs(config)
    stampStore.setConfig(config)
    syncConfigToParent()
    exportDock.exportFilename = exportDock.buildExportFilename(config)
    drawStamp()
    await nextTick()
    propertiesPanelRef.value?.restoreDrawConfigs()
  }
})

// 常用模板预设
const templates = useTemplatePresets((config) => exportDock.getPrimaryCompanyName(config))

// 导出模板元信息弹窗状态
const showTemplateMetaDialog = ref(false)
const templateDefaultTitle = ref('')
const templateDefaultCategories = ref('')
const pendingTemplateConfig = ref<IDrawStampConfig | null>(null)

const canvasMeta = computed(() => {
  const config = stampStore.state.config
  const width = Math.round(Number(config?.width) || 40)
  const height = Math.round(Number(config?.height) || 40)
  return `${width} x ${height} mm`
})

const rulerMarks = computed(() => {
  const config = stampStore.state.config
  const width = Math.round(Number(config?.width) || 40)
  const height = Math.round(Number(config?.height) || 40)
  return {
    h: [0, Math.round(width / 2), width],
    v: [0, Math.round(height / 2), height]
  }
})

const selectedElementLabel = computed(() => {
  const typeMap: Record<string, string> = {
    basic: 'basic',
    company: 'company',
    stampType: 'stampType',
    code: 'code',
    taxNumber: 'taxNumber',
    star: 'star',
    circle: 'circle',
    image: 'image',
    svg: 'svg',
    aging: 'aging',
    roughEdge: 'roughEdge',
    security: 'security',
    line: 'line'
  }
  const key = selectedElementType.value ? typeMap[selectedElementType.value] || 'element' : 'basic'
  const label = `${t(`studio.editor.selection.${key}`)}${selectedElementIndex.value > 0 ? ` ${selectedElementIndex.value + 1}` : ''}`
  return t('studio.editor.selection.selected', { name: label })
})

const showSelectionFrame = computed(() => {
  return Boolean(selectedElementType.value && stampStore.state.config)
})

const selectionFrameStyle = computed(() => {
  if (!stampStore.state.config || !drawStampUtils) return {}
  canvasViewRevision.value
  const frame = selectedElementType.value === 'image'
    ? drawStampUtils.getImageViewportFrame(Math.max(selectedElementIndex.value, 0))
    : drawStampUtils.getStampViewportFrame()
  const canvasEl = stampCanvas.value
  const canvasScaleX = canvasEl ? canvasEl.getBoundingClientRect().width / canvasEl.width : 1
  const canvasScaleY = canvasEl ? canvasEl.getBoundingClientRect().height / canvasEl.height : 1
  const canvasOffsetLeft = canvasEl?.offsetLeft ?? 20
  const canvasOffsetTop = canvasEl?.offsetTop ?? 20
  const canvasCssWidth = canvasEl?.getBoundingClientRect().width || 600
  const canvasCssHeight = canvasEl?.getBoundingClientRect().height || 600
  const rawLeft = frame.left * canvasScaleX
  const rawTop = frame.top * canvasScaleY
  const rawWidth = Math.max(24, frame.width * canvasScaleX)
  const rawHeight = Math.max(24, frame.height * canvasScaleY)
  const right = Math.max(0, Math.min(rawLeft + rawWidth, canvasCssWidth))
  const bottom = Math.max(0, Math.min(rawTop + rawHeight, canvasCssHeight))
  const width = Math.min(canvasCssWidth, Math.max(24, right - Math.max(0, Math.min(rawLeft, canvasCssWidth))))
  const height = Math.min(canvasCssHeight, Math.max(24, bottom - Math.max(0, Math.min(rawTop, canvasCssHeight))))
  const left = Math.max(0, Math.min(rawLeft, canvasCssWidth - width))
  const top = Math.max(0, Math.min(rawTop, canvasCssHeight - height))

  return {
    left: `${canvasOffsetLeft + left}px`,
    top: `${canvasOffsetTop + top}px`,
    width: `${width}px`,
    height: `${height}px`
  }
})

const canvasBackgroundOptions = computed(() => [
  { value: 'grid' as const, label: t('studio.editor.backgrounds.grid'), icon: '▦' },
  { value: 'paper' as const, label: t('studio.editor.backgrounds.paper'), icon: '□' },
  { value: 'checker' as const, label: t('studio.editor.backgrounds.checker'), icon: '▧' }
])

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
    stampStore.setConfig(localDraft.cloneConfig(config))
    syncConfigToParent()
    updateViewState()
  })

  // 如果父组件传入了模板配置，优先使用该配置初始化
  if (props.modelValue) {
    const initialConfig = localDraft.cloneConfig(props.modelValue)
    drawStampUtils.setDrawConfigs(initialConfig)
    stampStore.setConfig(initialConfig)
  } else {
    const drafts = localDraft.readLocalDrafts()
    localDraft.draftVersions = drafts
    const draft = drafts[0]
    if (draft) {
      const draftConfig = localDraft.cloneConfig(draft.config)
      drawStampUtils.setDrawConfigs(draftConfig)
      stampStore.setConfig(draftConfig)
      localDraft.draftSavedAt = draft.savedAt
      localDraft.draftSaveState = 'saved'
      localDraft.hasLocalDraft = true
    } else {
      stampStore.setConfig(drawStampUtils.getDrawConfigs())
      localDraft.hasLocalDraft = false
    }
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
    showErrorToast(t('errors.loadTemplateFailed'))
  } finally {
    // 清除文件选择，以便可以再次选择同一个文件
    inputEl.value = ''
  }
}

const applyTemplatePreset = async (presetKey: TemplatePresetKey) => {
  if (!drawStampUtils) return
  templates.activeTemplatePreset = presetKey
  const presetConfig = templates.createPresetConfig(presetKey)
  drawStampUtils.setDrawConfigs(presetConfig)
  drawStampUtils.resetZoom()
  stampStore.setConfig(presetConfig)
  syncConfigToParent()
  exportDock.exportFilename = exportDock.buildExportFilename(presetConfig)
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
  blankConfig.taxNumberList = []
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
  templateDefaultTitle.value = defaultTitle

  // 预填分类（多个分类使用空格分隔）
  const defaultCategories = Array.isArray(cleanedConfig.categories)
    ? cleanedConfig.categories.join(' ')
    : cleanedConfig.category || ''
  templateDefaultCategories.value = defaultCategories

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
  config.taxNumberList = []
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

const getFittedImageSize = (payload: ExtractStampResult, config: IDrawStampConfig) => {
  const sourceWidth = Math.max(1, payload.width || 1)
  const sourceHeight = Math.max(1, payload.height || 1)
  const maxWidth = Math.max(1, config.width || 40)
  const maxHeight = Math.max(1, config.height || maxWidth)
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight)

  return {
    width: Number((sourceWidth * scale).toFixed(1)),
    height: Number((sourceHeight * scale).toFixed(1))
  }
}

const handleExtractedStampImage = async (payload: ExtractStampResult) => {
  if (!drawStampUtils) return

  const currentConfig = drawStampUtils.getDrawConfigs()
  clearGeneratedStampElements(currentConfig)
  const fittedSize = getFittedImageSize(payload, currentConfig)

  const imageItem: IDrawImage = {
    imageUrl: payload.dataUrl,
    imageWidth: fittedSize.width,
    imageHeight: fittedSize.height,
    positionX: 0,
    positionY: 0,
    keepAspectRatio: true,
    fitToStamp: false,
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

const confirmSaveTemplate = (payload: { title: string; categories: string }) => {
  if (!pendingTemplateConfig.value) {
    closeTemplateMetaDialog()
    return
  }

  const config = pendingTemplateConfig.value

  if (payload.title) {
    config.title = payload.title
  }

  if (payload.categories) {
    const parts = payload.categories.split(/\s+/).filter(Boolean)
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
  const fittedImage = newConfig.imageList?.find(image => image.fitToStamp)
  if (fittedImage) {
    fittedImage.imageWidth = Number(newConfig.width.toFixed(1))
    fittedImage.imageHeight = Number(newConfig.height.toFixed(1))
  }
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

watch(
  () => stampStore.state.config,
  (config) => {
    localDraft.scheduleLocalDraftSave(config)
  },
  { deep: true }
)

// 点击草稿菜单外部时关闭菜单
const handleGlobalClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  if (!target?.closest?.('.draft-menu-wrap')) {
    localDraft.isDraftMenuOpen = false
  }
}

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

  window.addEventListener('beforeunload', localDraft.handleBeforeUnload)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('click', handleGlobalClick)
  drawStampUtils?.canvas?.addEventListener('click', handleCanvasClick)
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
  localDraft.handleBeforeUnload()
  window.removeEventListener('beforeunload', localDraft.handleBeforeUnload)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('click', handleGlobalClick)
  drawStampUtils?.canvas?.removeEventListener('click', handleCanvasClick)
})
</script>

<style scoped>
/* 错误提示 toast（替代原生 alert） */
.error-toast {
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: min(90vw, 420px);
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--studio-ui-red-soft);
  border: 1px solid rgba(163, 58, 50, 0.32);
  box-shadow: 0 6px 20px rgba(60, 30, 28, 0.12);
  color: var(--studio-ui-red-deep);
  font-size: 13px;
  font-weight: 500;
}

.error-toast-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--studio-ui-red);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  font-style: normal;
  line-height: 1;
}

.error-toast-msg {
  flex: 1;
  min-width: 0;
}

.error-toast-close {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: 0;
  background: transparent;
  color: var(--studio-ui-red-deep);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.18s var(--ease-out);
}

.error-toast-close:hover {
  background: rgba(163, 58, 50, 0.12);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s var(--ease-out), transform 0.2s var(--ease-out);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

/* 主工作区：三栏布局 */
.main-workspace {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.68), rgba(244, 245, 241, 0.86)),
    var(--studio-paper);
  border: 1px solid var(--studio-line);
  border-radius: 14px;
  height: calc(100vh - 48px);
  min-height: calc(100vh - 48px);
  overflow: hidden;
  box-shadow:
    0 16px 44px rgba(40, 48, 38, 0.11),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.top-toolbar {
  min-height: 72px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--studio-line-hair);
  background: transparent;
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

.toolbar-logo {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  display: block;
  border-radius: 12px;
  filter: drop-shadow(0 8px 14px rgba(111, 18, 24, 0.14));
}

.toolbar-status-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.toolbar-brand h1,
.toolbar-kicker {
  margin: 0;
}

.toolbar-brand h1 {
  color: var(--studio-ink);
  font-size: 18px;
  line-height: 1.2;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.toolbar-kicker {
  color: var(--studio-muted);
  font-size: 11px;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.toolbar-status {
  border: 1px solid var(--studio-line);
  border-radius: 999px;
  color: var(--studio-tool-blue);
  background: var(--studio-tool-blue-soft);
  font-size: 12px;
  padding: 4px 9px;
  white-space: nowrap;
}

.draft-menu-wrap {
  position: relative;
}

.toolbar-draft-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--studio-line);
  border-radius: 999px;
  color: var(--studio-muted);
  background: var(--studio-panel);
  font-size: 12px;
  line-height: 1.2;
  padding: 4px 9px;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.toolbar-draft-status:hover,
.toolbar-draft-status.open {
  color: var(--studio-ink);
  border-color: var(--studio-line-strong);
  background: #ffffff;
}

.draft-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--studio-soft);
  box-shadow: 0 0 0 3px rgba(139, 149, 138, 0.14);
}

.draft-status-chevron {
  color: #9aa5b5;
  font-size: 11px;
  transform: translateY(-1px);
}

.toolbar-draft-status.saving {
  color: #7c5b1b;
  background: #fff8e8;
  border-color: #f0dbac;
}

.toolbar-draft-status.saved {
  color: #32714b;
  background: #f0fbf5;
  border-color: #c9ead8;
}

.toolbar-draft-status.failed {
  color: #a12a34;
  background: #fff3f4;
  border-color: #efc4ca;
}

.toolbar-draft-status.saving .draft-status-dot {
  background: #d49a2b;
  box-shadow: 0 0 0 3px rgba(212, 154, 43, 0.14);
}

.toolbar-draft-status.saved .draft-status-dot {
  background: #3fa66b;
  box-shadow: 0 0 0 3px rgba(63, 166, 107, 0.14);
}

.toolbar-draft-status.failed .draft-status-dot {
  background: var(--studio-ui-red);
  box-shadow: 0 0 0 3px rgba(163, 58, 50, 0.13);
}

.draft-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 30;
  width: 270px;
  padding: 10px;
  border: 1px solid #dbe2ec;
  border-radius: 10px;
  background: var(--studio-panel);
  box-shadow: 0 18px 44px rgba(40, 48, 38, 0.16);
}

.draft-menu::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 22px;
  width: 9px;
  height: 9px;
  border-left: 1px solid #dbe2ec;
  border-top: 1px solid #dbe2ec;
  background: var(--studio-panel);
  transform: rotate(45deg);
}

.draft-menu-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px 8px;
  border-bottom: 1px solid #edf1f5;
}

.draft-menu-head strong {
  color: var(--studio-ink);
  font-size: 13px;
}

.draft-menu-head button {
  border: 0;
  background: transparent;
  color: #8a95a5;
  font-size: 12px;
  padding: 2px 4px;
  cursor: pointer;
}

.draft-menu-head button:hover {
  color: var(--studio-ui-red);
}

.draft-version-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
}

.draft-version-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  border: 1px solid transparent;
  border-radius: 7px;
  background: #fbfaf6;
  padding: 9px 8px;
  color: var(--studio-ink);
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.draft-version-item:hover {
  background: #f2f4ef;
  border-color: var(--studio-line);
}

.draft-version-item span {
  min-width: 0;
}

.draft-version-item strong,
.draft-version-item small {
  display: block;
}

.draft-version-item strong {
  font-size: 12px;
  line-height: 1.3;
  color: var(--studio-ink);
}

.draft-version-item small {
  margin-top: 3px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--studio-muted);
  font-size: 11px;
}

.draft-version-item em {
  flex: 0 0 auto;
  font-style: normal;
  color: var(--studio-ui-red);
  font-size: 12px;
}

.draft-menu-empty {
  margin: 0;
  padding: 14px 4px 4px;
  color: var(--studio-muted);
  font-size: 12px;
  line-height: 1.5;
}

.toolbar-actions {
  display: flex;
  justify-content: flex-end;
  gap: 7px;
  min-width: 220px;
}

.toolbar-actions .toolbar-btn:nth-child(3) {
  margin-left: 10px;
  position: relative;
}

.toolbar-actions .toolbar-btn:nth-child(3)::before {
  content: "";
  position: absolute;
  left: -9px;
  top: 7px;
  bottom: 7px;
  width: 1px;
  background: var(--studio-line-hair);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 7px 11px;
  border-radius: 7px;
  border: 1px solid var(--studio-line);
  background: var(--studio-panel);
  cursor: pointer;
  font-size: 13px;
  color: var(--studio-ink);
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.toolbar-btn:hover {
  background: var(--studio-tool-blue-soft);
  border-color: rgba(35, 76, 92, 0.34);
  color: var(--studio-tool-blue);
  transform: translateY(-1px);
}

.toolbar-btn.compact {
  background: var(--studio-panel);
}

.toolbar-btn.primary {
  border-color: var(--studio-ui-red);
  background: var(--studio-ui-red);
  color: #ffffff;
}

.toolbar-btn.primary:hover {
  background: var(--studio-ui-red-deep);
  border-color: var(--studio-ui-red-deep);
  color: #ffffff;
}

.toolbar-icon {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eef1eb;
  color: var(--studio-muted);
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
  background: var(--studio-panel);
  border-right: 1px solid var(--studio-line-hair);
}

.template-library {
  flex: 0 0 auto;
  padding: 14px;
  border-bottom: 1px solid var(--studio-line);
  background:
    linear-gradient(180deg, rgba(255, 254, 250, 0.96), rgba(242, 244, 239, 0.96));
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
  color: var(--studio-ink);
  font-size: 15px;
  line-height: 1.3;
  font-weight: 700;
}

.panel-eyebrow {
  display: block;
  color: var(--studio-muted);
  font-size: 10px;
  line-height: 1.4;
  letter-spacing: 0;
  text-transform: uppercase;
}

.library-actions {
  display: flex;
  gap: 6px;
}

.library-link {
  min-height: 30px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid var(--studio-line);
  background: var(--studio-panel);
  color: var(--studio-muted);
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.library-link:hover {
  background: #f7eeee;
  border-color: rgba(163, 58, 50, 0.4);
  color: var(--studio-ui-red);
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
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background:
    linear-gradient(180deg, rgba(255, 254, 250, 0.98), rgba(246, 247, 243, 0.98));
  color: var(--studio-ink);
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
    linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(250, 246, 244, 0.98));
  border-color: rgba(163, 58, 50, 0.32);
  box-shadow: var(--studio-shadow-panel);
  transform: translateY(-1px);
}

.template-current.open,
.template-option.active {
  border-color: var(--studio-ui-red);
  box-shadow: 0 0 0 2px rgba(163, 58, 50, 0.08), var(--studio-shadow-panel);
}

.template-chevron {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #eef1eb;
  color: var(--studio-muted);
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
  background: #f7eeee;
  color: var(--studio-ui-red);
  transform: rotate(180deg);
}

.template-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: min(410px, calc(100vh - 300px));
  overflow-y: auto;
  padding: 6px;
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: rgba(255, 254, 250, 0.98);
  box-shadow: 0 16px 34px rgba(40, 48, 38, 0.16);
}

.template-menu::-webkit-scrollbar {
  width: 6px;
}

.template-menu::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #d7dee8;
}

.template-category-tabs {
  position: sticky;
  top: 0;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
  padding: 2px;
  margin-bottom: 6px;
  border: 1px solid var(--studio-line);
  border-radius: 7px;
  background: #eef1eb;
}

.template-category-tabs button {
  min-width: 0;
  min-height: 26px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--studio-muted);
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.template-category-tabs button:hover,
.template-category-tabs button.active {
  background: #ffffff;
  color: var(--studio-ui-red);
  box-shadow: 0 1px 5px rgba(40, 48, 38, 0.08);
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

.template-option.preset-ellipse .preset-stamp {
  width: 35px;
  height: 25px;
}

.preset-preview {
  width: 58px;
  height: 54px;
  border: 1px solid var(--studio-line);
  border-radius: 7px;
  background:
    linear-gradient(#edf1f6 1px, transparent 1px),
    linear-gradient(90deg, #edf1f6 1px, transparent 1px),
    var(--studio-panel);
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
  color: var(--studio-stamp-red);
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

.preset-ellipse .preset-stamp {
  width: 42px;
  height: 30px;
}

.preset-ellipse .preset-ring {
  inset: 2px;
  border-radius: 999px / 72%;
}

.preset-ellipse .preset-star {
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
  background: #f7eeee;
  color: var(--studio-ui-red);
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
  color: var(--studio-muted);
  font-size: 12px;
  line-height: 1.3;
}

/* Canvas 区域 */
.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #ecefe8;
  border-right: 1px solid var(--studio-line);
  overflow: hidden;
}

.canvas-header {
  min-height: 54px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--studio-line);
  background:
    linear-gradient(180deg, rgba(255, 254, 250, 0.98), rgba(248, 249, 245, 0.98));
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
  color: var(--studio-ink);
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
  color: var(--studio-muted);
  font-size: 12px;
}

.canvas-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #2f8f61;
  box-shadow: 0 0 0 4px rgba(47, 143, 97, 0.14);
}

.canvas-tools,
.footer-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.canvas-tool-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 34px;
  padding: 2px;
  border: 1px solid rgba(191, 200, 187, 0.5);
  border-radius: 9px;
  background: rgba(255, 254, 250, 0.58);
}

.canvas-tool-group + .canvas-tool-group {
  margin-left: 4px;
}

.canvas-tool-group-actions {
  background: rgba(255, 248, 246, 0.62);
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
  transition: color 0.18s var(--ease-out), border-color 0.18s var(--ease-out);
}

.canvas-tab.active {
  color: var(--studio-tool-blue);
  border-bottom-color: var(--studio-tool-blue);
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 0.72), transparent 42%),
    linear-gradient(rgba(191, 200, 187, 0.34) 1px, transparent 1px),
    linear-gradient(90deg, rgba(191, 200, 187, 0.34) 1px, transparent 1px);
  background-color: #ecefe8;
  background-size: 24px 24px;
  overflow: hidden;
  padding: 24px;
  min-width: 0;
}

.canvas-wrapper.canvas-bg-paper {
  background:
    radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.85), transparent 48%),
    linear-gradient(rgba(191, 200, 187, 0.28) 1px, transparent 1px),
    linear-gradient(90deg, rgba(191, 200, 187, 0.28) 1px, transparent 1px);
  background-color: #f4f5f1;
  background-size: auto, 32px 32px, 32px 32px;
}

.canvas-wrapper.canvas-bg-checker {
  background:
    linear-gradient(45deg, #dde3dc 25%, transparent 25%),
    linear-gradient(-45deg, #dde3dc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #dde3dc 75%),
    linear-gradient(-45deg, transparent 75%, #dde3dc 75%);
  background-color: #f8f7f2;
  background-position: 0 0, 0 12px, 12px -12px, -12px 0;
  background-size: 24px 24px;
}

.canvas-stage {
  position: relative;
  width: min(640px, calc(100% - 8px));
  height: auto;
  aspect-ratio: 1;
  flex: 0 1 auto;
  border: 1px solid var(--studio-line);
  background:
    linear-gradient(45deg, #f4f6f8 25%, transparent 25%),
    linear-gradient(-45deg, #f4f6f8 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f4f6f8 75%),
    linear-gradient(-45deg, transparent 75%, #f4f6f8 75%);
  background-color: var(--studio-panel);
  background-size: 22px 22px;
  background-position: 0 0, 0 11px, 11px -11px, -11px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 20px 46px rgba(40, 48, 38, 0.15),
    0 0 0 8px rgba(255, 255, 255, 0.28);
}

.canvas-stage canvas {
  width: calc(100% - 40px);
  height: calc(100% - 40px);
}

.canvas-wrapper.canvas-bg-paper .canvas-stage {
  background:
    linear-gradient(180deg, rgba(255, 254, 250, 0.98), rgba(250, 249, 244, 0.98));
}

.canvas-wrapper.canvas-bg-grid .canvas-stage {
  background:
    linear-gradient(rgba(191, 200, 187, 0.34) 1px, transparent 1px),
    linear-gradient(90deg, rgba(191, 200, 187, 0.34) 1px, transparent 1px);
  background-color: var(--studio-panel);
  background-size: 24px 24px;
}

.canvas-ruler {
  position: absolute;
  z-index: 1;
  color: var(--studio-tool-blue);
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.01em;
  user-select: none;
}

.canvas-ruler.horizontal {
  top: 18px;
  left: 56px;
  right: 56px;
  height: 24px;
  border-bottom: 1px solid rgba(35, 76, 92, 0.34);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.canvas-ruler.vertical {
  top: 56px;
  bottom: 56px;
  left: 18px;
  width: 24px;
  border-right: 1px solid rgba(35, 76, 92, 0.34);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}

.canvas-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  min-height: 54px;
  padding: 9px 14px;
  border-top: 1px solid var(--studio-line);
  background:
    linear-gradient(180deg, rgba(255, 254, 250, 0.98), rgba(246, 247, 243, 0.98));
  flex-shrink: 0;
}

.canvas-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 14px;
  color: var(--studio-muted);
  font-size: 12px;
  min-width: 0;
}

.canvas-status span {
  white-space: nowrap;
}

.canvas-status span + span::before,
.canvas-status a::before {
  content: "";
  display: inline-block;
  width: 1px;
  height: 12px;
  margin-right: 14px;
  vertical-align: -2px;
  background: var(--studio-line);
}

.canvas-status a {
  color: var(--studio-muted);
  font-size: 12px;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.canvas-status a:hover {
  color: var(--studio-ui-red);
}

.canvas-action-btn {
  width: 30px;
  height: 30px;
  padding: 0;
  border-radius: 6px;
  border: 1px solid var(--studio-line);
  background: var(--studio-panel);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--studio-ink);
  font-size: 14px;
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
}

.canvas-action-btn:hover,
.canvas-action-btn.active {
  background: var(--studio-tool-blue-soft);
  border-color: rgba(35, 76, 92, 0.34);
  color: var(--studio-tool-blue);
  transform: translateY(-1px);
}

.canvas-action-btn.primary {
  border-color: var(--studio-ui-red);
  background: var(--studio-ui-red);
  color: #ffffff;
}

.canvas-action-btn.primary:hover {
  border-color: var(--studio-ui-red-deep);
  background: var(--studio-ui-red-deep);
}

.zoom-indicator {
  min-width: 44px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--studio-line);
  border-radius: 6px;
  background: #f7f8f3;
  color: var(--studio-muted);
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
  flex-wrap: wrap;
  gap: 6px 8px;
  padding: 4px;
  border: 1px solid var(--studio-line-hair);
  border-radius: 9px;
  background: rgba(255, 254, 250, 0.88);
}

.export-dock-title {
  padding: 0 5px;
  color: var(--studio-muted);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.export-scale-mini {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border-radius: 6px;
  background: var(--studio-panel);
  border: 1px solid var(--studio-line);
}

.export-scale-mini button {
  min-width: 28px;
  height: 24px;
  padding: 0 6px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--studio-muted);
  cursor: pointer;
  font-size: 12px;
}

.export-scale-mini button.active {
  background: #f7eeee;
  color: var(--studio-ui-red);
  font-weight: 700;
}

.white-bg-toggle {
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 7px;
  border: 1px solid var(--studio-line);
  border-radius: 6px;
  background: var(--studio-panel);
  color: var(--studio-muted);
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
  border: 1px solid var(--studio-line);
  border-radius: 6px;
  background: var(--studio-panel);
  color: var(--studio-ink);
  font-size: 12px;
}

.export-name-mini:focus {
  outline: none;
  border-color: rgba(35, 76, 92, 0.34);
  box-shadow: 0 0 0 3px rgba(35, 76, 92, 0.12);
}

.save-count-small {
  font-size: 12px;
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
  border-top-color: var(--studio-tool-blue);
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

@media (max-width: 1280px) {
  .canvas-footer {
    gap: 8px;
    padding: 8px 12px;
  }

  .export-dock {
    gap: 4px 6px;
    padding: 3px;
  }

  .export-dock-title {
    padding: 0 4px;
    font-size: 11px;
  }

  .canvas-status {
    gap: 8px 10px;
  }
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
    height: auto;
    min-height: calc(100dvh - 20px);
    overflow: visible;
  }

  .seo-grid {
    grid-template-columns: 1fr;
  }

  .stamp-draw-container {
    flex-direction: column;
    overflow: visible;
  }

  .workspace-left {
    order: 3;
    width: 100%;
    min-width: 0;
    max-height: none;
    border-right: none;
    border-bottom: 1px solid var(--studio-line);
  }

  .workspace-left :deep(.element-list-panel) {
    max-height: 380px;
  }

  .template-library {
    padding: 12px;
  }

  .template-menu {
    max-height: 276px;
    overflow-y: auto;
  }

  .canvas-area {
    order: 1;
    min-height: 520px;
    border-right: none;
    border-bottom: 1px solid var(--studio-line);
  }

  .canvas-wrapper {
    min-height: 430px;
    padding: 54px 18px 28px;
  }

  .canvas-stage {
    width: min(640px, calc(100vw - 84px));
    height: min(640px, calc(100vw - 84px));
  }

  .canvas-stage canvas {
    width: 100%;
    height: 100%;
  }

  .canvas-ruler.horizontal {
    left: 42px;
    right: 42px;
  }

  .canvas-ruler.vertical {
    top: 50px;
    bottom: 50px;
  }

  :deep(.properties-panel) {
    order: 2;
  }
}

@media (max-width: 640px) {
  .seo-content {
    padding: 16px;
  }

  .seo-content::after {
    opacity: 0.45;
    right: 12px;
  }

  .seo-meta span {
    flex: 1 1 120px;
    text-align: center;
  }

  .seo-links a {
    flex: 1 1 130px;
    text-align: center;
  }

  .top-toolbar {
    min-height: auto;
    padding: 12px;
  }

  .toolbar-brand {
    width: 100%;
    align-items: center;
    flex-direction: row;
    gap: 8px;
  }

  .toolbar-status-group {
    flex-wrap: wrap;
  }

  .draft-menu {
    left: auto;
    right: 0;
    width: min(270px, calc(100vw - 32px));
  }

  .draft-menu::before {
    left: auto;
    right: 22px;
  }

  .toolbar-actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .toolbar-actions .toolbar-btn:nth-child(3) {
    margin-left: 0;
  }

  .toolbar-actions .toolbar-btn:nth-child(3)::before {
    display: none;
  }

  .toolbar-btn {
    justify-content: center;
    padding-inline: 8px;
  }

  .canvas-header,
  .canvas-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .footer-actions {
    width: 100%;
  }

  .footer-actions .canvas-action-btn {
    flex: 1;
  }

  .canvas-header {
    gap: 10px;
  }

  .canvas-tools {
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 2px;
  }

  .canvas-tool-group {
    flex: 0 0 auto;
  }

  .canvas-action-btn,
  .zoom-indicator {
    flex: 0 0 auto;
  }

  .canvas-wrapper {
    min-height: 360px;
    padding: 50px 14px 24px;
  }

  .canvas-stage {
    width: min(420px, calc(100vw - 56px));
    height: min(420px, calc(100vw - 56px));
  }

  .canvas-status {
    width: 100%;
    justify-content: space-between;
    overflow: hidden;
  }

  .template-current {
    min-height: 66px;
  }

  .export-dock {
    width: 100%;
    flex-wrap: wrap;
  }

  .export-name-mini {
    flex: 1 1 160px;
    width: auto;
  }

  .export-dialog {
    width: min(100vw - 20px, 920px);
    max-height: calc(100dvh - 20px);
    overflow-y: auto;
  }

  .export-dialog-content {
    grid-template-columns: 1fr;
  }

  .export-preview-panel {
    border-right: 0;
    border-bottom: 1px solid var(--studio-line);
  }

  .export-dialog .format-options {
    grid-template-columns: 1fr;
  }
}
</style>
