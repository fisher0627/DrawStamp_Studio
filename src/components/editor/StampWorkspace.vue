<template>
  <!-- 导出格式弹窗 -->
  <div v-if="showFormatDialog" class="legal-dialog-overlay" @click.self="closeFormatDialog">
    <div class="legal-dialog export-dialog">
      <div class="export-dialog-header">
        <div>
          <h3>{{ t('stamp.exportFormat.title') }}</h3>
        </div>
        <button type="button" class="export-close-button" @click="closeFormatDialog" :aria-label="t('homepage.canvas.close')">×</button>
      </div>
      <div class="legal-content export-dialog-content">
        <section class="export-preview-panel">
          <div class="export-preview-card" :class="{ checker: selectedFormat === 'png' && !useWhitePngBackground }">
            <img v-if="exportPreviewUrl" :src="exportPreviewUrl" alt="导出预览" />
            <div v-else class="export-preview-empty" aria-busy="true" :aria-label="t('homepage.canvas.previewGenerating')">
              <span class="skeleton-stamp"></span>
            </div>
          </div>
          <div class="export-preview-meta">
            <strong>{{ exportSummary }}</strong>
            <span>{{ exportBackgroundLabel }}</span>
          </div>
        </section>

        <section class="export-settings-panel">
          <div class="export-section">
            <div class="export-section-title">
              <label>文件格式</label>
              <span>{{ selectedFormatInfo?.tip }}</span>
            </div>
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
                <span>
                  <span class="format-name">{{ format.name }}</span>
                  <span class="format-desc">{{ format.desc }}</span>
                </span>
                <em v-if="format.value === 'png'">推荐</em>
              </button>
            </div>
          </div>

          <div v-if="selectedFormat === 'jpeg'" class="quality-setting">
            <label>{{ t('stamp.exportFormat.quality') }} <strong>{{ jpegQuality }}%</strong></label>
            <input
              type="range"
              v-model.number="jpegQuality"
              min="10"
              max="100"
              step="5"
              class="quality-slider"
            />
          </div>

          <div class="export-section">
            <div class="export-section-title">
              <label>导出倍率</label>
              <span>{{ exportSizeLabel }}</span>
            </div>
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

          <div class="export-section">
            <div class="export-section-title">
              <label>文件名</label>
              <span>自动补充扩展名</span>
            </div>
            <input
              v-model="exportFilename"
              type="text"
              class="export-name-input"
              placeholder="自动使用公司名"
            />
          </div>

          <details class="export-advanced">
            <summary>更多尺寸设置</summary>
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
          </details>
        </section>
      </div>
      <div class="dialog-buttons">
        <button @click="closeFormatDialog" class="cancel-button">{{ t('stamp.exportFormat.cancel') }}</button>
        <button @click="confirmExport" class="confirm-button">下载 {{ selectedFormat.toUpperCase() }}</button>
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
              :class="draftStatusClass"
              @click="handleDraftStatusClick"
              :aria-expanded="isDraftMenuOpen"
              :title="draftSaveState === 'failed' ? t('homepage.canvas.retrySave') : t('homepage.canvas.viewRecentDraft')"
            >
              <span class="draft-status-dot"></span>
              <span>{{ draftStatusLabel }}</span>
              <span class="draft-status-chevron">⌄</span>
            </button>
            <div v-if="isDraftMenuOpen" class="draft-menu">
              <div class="draft-menu-head">
                <strong>{{ t('homepage.canvas.recentDraft') }}</strong>
                <button
                  v-if="draftVersions.length"
                  type="button"
                  @click="clearLocalDraft"
                >
                  {{ t('homepage.canvas.clearDraft') }}
                </button>
              </div>
              <div v-if="draftVersions.length" class="draft-version-list">
                <button
                  v-for="draft in draftVersions"
                  :key="draft.id"
                  type="button"
                  class="draft-version-item"
                  @click="restoreDraftVersion(draft.id)"
                >
                  <span>
                    <strong>{{ formatDraftTime(draft.savedAt) }}</strong>
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
        <button class="toolbar-btn compact" type="button" @click="openExtractorDialog" :title="t('homepage.canvas.extractStampTitle')">
          <span class="toolbar-icon">印</span>
          <span class="toolbar-label">{{ t('homepage.canvas.extractStamp') }}</span>
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
              :class="[`preset-${activeTemplatePresetInfo.key}`, `preset-${activeTemplatePresetInfo.shape}`, { open: isTemplatePickerOpen }]"
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
              <div class="template-category-tabs" aria-label="模板分类">
                <button
                  v-for="category in templatePresetCategories"
                  :key="category.key"
                  type="button"
                  :class="{ active: activeTemplateCategory === category.key }"
                  @click="activeTemplateCategory = category.key"
                >
                  {{ category.label }}
                </button>
              </div>
              <button
                v-for="preset in filteredTemplatePresets"
                :key="preset.key"
                type="button"
                class="template-option"
                :class="[`preset-${preset.key}`, `preset-${preset.shape}`, { active: activeTemplatePreset === preset.key }]"
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
                v-for="option in scaleOptions"
                :key="option.value"
                type="button"
                :class="{ active: selectedScale === option.value }"
                @click="applyExportScale(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            <label class="white-bg-toggle" :title="t('homepage.canvas.whiteBackground')">
              <input type="checkbox" v-model="useWhitePngBackground" />
              <span>{{ t('homepage.canvas.whiteBackground') }}</span>
            </label>
            <input
              v-model="exportFilename"
              class="export-name-mini"
              type="text"
              :placeholder="t('homepage.canvas.filenamePlaceholder')"
              @focus="prepareExportDock"
            />
            <button class="canvas-action-btn primary" @click="quickExportFromDock" :title="t('homepage.canvas.quickExportTitle')">
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

  <section class="seo-content" aria-labelledby="seo-title">
    <div class="seo-hero">
      <p class="seo-eyebrow">Browser Local Stamp Editor</p>
      <h2 id="seo-title">在线电子印章生成、图片提取与透明 PNG 导出</h2>
      <p>
        DrawStamp Studio 是一个浏览器本地运行的在线电子印章工作台，可生成圆章、椭圆章、合同专用章、财务专用章和发票专用章图片，并支持从扫描件或照片中提取红色印章。
        文字、字体、边框、五角星、内圈、编码和图片元素都可以直接编辑，导出支持透明 PNG、白底 PNG、SVG 和 JPEG；核心图片处理不上传服务器，仅适合学习、测试、设计预览和合规授权场景。
      </p>
      <div class="seo-meta" aria-label="核心特性">
        <span>本地处理</span>
        <span>透明 PNG</span>
        <span>SVG / JPEG</span>
        <span>模板草稿</span>
      </div>
    </div>

    <div class="seo-grid">
      <article>
        <span>01</span>
        <h3>电子印章生成器</h3>
        <p>内置常用模板和精细参数面板，支持公司名称、印章类型、编码、税号、中间文字等内容编辑，适合制作测试、演示和合规授权场景下的印章图片。</p>
      </article>
      <article>
        <span>02</span>
        <h3>图片提取透明印章</h3>
        <p>支持拖拽上传印章扫描件或照片，在浏览器本地提取红色印章区域，输出透明背景结果，不需要把合同、票据或图片上传到服务器。</p>
      </article>
      <article>
        <span>03</span>
        <h3>PNG / SVG / JPEG 导出</h3>
        <p>导出面板支持透明 PNG、白底 PNG、SVG 和 JPEG，并可调整导出倍率、尺寸和文件名，方便插入 Word、PDF、PPT 或内部测试文档。</p>
      </article>
    </div>

    <div class="seo-faq" aria-label="常见问题">
      <h2>常见问题</h2>
      <details open>
        <summary>DrawStamp Studio 会上传我的印章图片吗？</summary>
        <p>不会。印章绘制、图片提取、模板草稿和导出都在浏览器端完成，项目没有为这些核心流程配置后端上传接口。</p>
      </details>
      <details>
        <summary>可以导出透明背景印章吗？</summary>
        <p>可以。推荐使用 PNG 格式并关闭白底选项，导出的透明 PNG 可用于文档排版、演示稿或内部测试素材。</p>
      </details>
      <details>
        <summary>这个工具适合真实盖章或伪造文件吗？</summary>
        <p>不适合。本项目仅用于学习、测试、设计预览和合规授权场景，请勿用于伪造合同、公文、票据或任何违法用途。</p>
      </details>
      <details>
        <summary>可以保存和继续编辑模板吗？</summary>
        <p>可以。当前配置可以导出为 JSON 模板，浏览器也会保存本地草稿，方便刷新后继续编辑。</p>
      </details>
    </div>

    <nav class="seo-links" aria-label="站点说明链接">
      <RouterLink to="/about">关于项目</RouterLink>
      <RouterLink to="/privacy">隐私政策</RouterLink>
      <RouterLink to="/terms">服务条款</RouterLink>
      <RouterLink to="/contact">联系反馈</RouterLink>
    </nav>
  </section>
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
import { DEFAULT_STAMP_RED } from '../../Constants'

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
const DRAFT_STORAGE_KEY = 'drawstamp-studio:draft:v1'
const DRAFT_SAVE_DELAY = 500
const DRAFT_VERSION_INTERVAL = 30 * 1000
const MAX_DRAFT_VERSIONS = 5
// 绘制工具
let drawStampUtils: DrawStampUtils
let exportPreviewRequestId = 0
let draftSaveTimer: number | undefined
let suppressDraftSave = false
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
const exportPreviewUrl = ref('')
const selectedRatio = ref<'original' | 'square' | '4:3' | '16:9' | 'custom'>('original')
const viewScalePercent = ref(100)
const canvasViewRevision = ref(0)
const canvasBackgroundMode = ref<'grid' | 'paper' | 'checker'>('grid')
const draftSavedAt = ref<number | null>(null)
const draftSaveState = ref<'idle' | 'saved' | 'saving' | 'failed'>('idle')
const hasLocalDraft = ref(false)
const draftVersions = ref<LocalDraftItem[]>([])
const isDraftMenuOpen = ref(false)

// 导出模板元信息弹窗状态
const showTemplateMetaDialog = ref(false)
const templateTitle = ref('')
const templateCategories = ref('')
const pendingTemplateConfig = ref<IDrawStampConfig | null>(null)

const exportFormats = computed(() => [
  { value: 'png' as const, name: 'PNG', icon: 'P', desc: '透明背景，适合文档和打印', tip: '最常用' },
  { value: 'svg' as const, name: 'SVG', icon: 'S', desc: '矢量格式，适合设计软件', tip: '可放大' },
  { value: 'jpeg' as const, name: 'JPEG', icon: 'J', desc: '白底图片，适合普通分享', tip: '体积小' }
])

const selectedFormatInfo = computed(() => {
  return exportFormats.value.find(format => format.value === selectedFormat.value)
})

const exportSizeLabel = computed(() => {
  const width = Math.round(exportWidth.value) || Math.round(defaultExportWidth.value) || 0
  const height = Math.round(exportHeight.value) || Math.round(defaultExportHeight.value) || 0
  return `${width} x ${height}px`
})

const exportSummary = computed(() => {
  return `${selectedFormat.value.toUpperCase()} · ${selectedScale.value}x · ${exportSizeLabel.value}`
})

const exportBackgroundLabel = computed(() => {
  if (selectedFormat.value === 'png') {
    return useWhitePngBackground.value ? '白色背景' : '透明背景'
  }
  if (selectedFormat.value === 'svg') {
    return '矢量导出'
  }
  return `JPEG 质量 ${jpegQuality.value}%`
})

const draftStatusLabel = computed(() => {
  if (draftSaveState.value === 'saving') return '保存中'
  if (draftSaveState.value === 'failed') return '未保存'
  if (!draftSavedAt.value) return hasLocalDraft.value ? '已恢复' : '自动保存'

  const savedDate = new Date(draftSavedAt.value)
  const time = savedDate.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  return `已保存 ${time}`
})

const draftStatusClass = computed(() => ({
  saving: draftSaveState.value === 'saving',
  saved: draftSaveState.value === 'saved',
  failed: draftSaveState.value === 'failed',
  open: isDraftMenuOpen.value
}))

const formatDraftTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const time = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  if (isToday) return `今天 ${time}`
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

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
  if (!selectedElementType.value) return '已选中：基础设置'
  const typeMap: Record<string, string> = {
    basic: '基础设置',
    company: '公司文字',
    stampType: '印章类型',
    code: '编码',
    taxNumber: '中间文字',
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

const templatePresetCategories = [
  { key: 'all' as const, label: '全部' },
  { key: 'general' as const, label: '通用' },
  { key: 'finance' as const, label: '财务' },
  { key: 'business' as const, label: '业务' }
]

const templatePresets = [
  { key: 'contract' as const, category: 'general' as const, name: '合同专用章', desc: '圆章 · 公司名 · 五角星', mark: '合', badge: '常用', shape: 'circle' },
  { key: 'official' as const, category: 'general' as const, name: '公司公章', desc: '圆章 · 标准公章布局', mark: '公', badge: '标准', shape: 'circle' },
  { key: 'finance' as const, category: 'finance' as const, name: '财务专用章', desc: '椭圆章 · 内圈 · 编码', mark: '财', badge: '财务', shape: 'ellipse' },
  { key: 'invoice' as const, category: 'finance' as const, name: '发票专用章', desc: '椭圆章 · 中间文字 · 编码', mark: '票', badge: '税务', shape: 'ellipse' },
  { key: 'receipt' as const, category: 'finance' as const, name: '收讫专用章', desc: '椭圆章 · 收款确认', mark: '收', badge: '收款', shape: 'ellipse' },
  { key: 'business' as const, category: 'business' as const, name: '业务专用章', desc: '圆章 · 业务办理', mark: '业', badge: '业务', shape: 'circle' },
  { key: 'quotation' as const, category: 'business' as const, name: '报价专用章', desc: '椭圆章 · 报价文件', mark: '价', badge: '报价', shape: 'ellipse' },
  { key: 'clean' as const, category: 'general' as const, name: '干净空白章', desc: '重置为清爽基础版', mark: '新', badge: '空白', shape: 'circle' }
]

type TemplatePresetKey = typeof templatePresets[number]['key']
type TemplateCategoryKey = typeof templatePresetCategories[number]['key']
const activeTemplatePreset = ref<TemplatePresetKey>('contract')
const activeTemplateCategory = ref<TemplateCategoryKey>('all')
const isTemplatePickerOpen = ref(false)
const activeTemplatePresetInfo = computed(() => {
  return templatePresets.find((preset) => preset.key === activeTemplatePreset.value) || templatePresets[0]
})
const filteredTemplatePresets = computed(() => {
  if (activeTemplateCategory.value === 'all') return templatePresets
  return templatePresets.filter(preset => preset.category === activeTemplateCategory.value)
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
    refreshExportPreview()
    return
  }
  const baseWidth = clampExportSize(defaultExportWidth.value, MIN_EXPORT_SIZE)
  const ratioValue = getRatioValue(ratio)
  exportWidth.value = Math.round(baseWidth)
  exportHeight.value = Math.round(baseWidth / ratioValue)
  exportHeight.value = clampExportSize(exportHeight.value, MIN_EXPORT_SIZE)
  refreshExportPreview()
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
  refreshExportPreview()
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
  refreshExportPreview()
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
  refreshExportPreview()
}

const handleHeightInput = () => {
  const fallback = Math.round(defaultExportHeight.value) || MIN_EXPORT_SIZE
  exportHeight.value = clampExportSize(exportHeight.value, fallback)
  if (selectedRatio.value !== 'custom') {
    const ratioValue = getRatioValue(selectedRatio.value)
    exportWidth.value = Math.round(exportHeight.value * ratioValue)
    exportWidth.value = clampExportSize(exportWidth.value, Math.round(defaultExportWidth.value) || MIN_EXPORT_SIZE)
  }
  refreshExportPreview()
}

const addWhiteBackgroundToDataUrl = (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      const previewCanvas = document.createElement('canvas')
      previewCanvas.width = image.naturalWidth || image.width
      previewCanvas.height = image.naturalHeight || image.height
      const ctx = previewCanvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height)
      ctx.drawImage(image, 0, 0)
      resolve(previewCanvas.toDataURL('image/png'))
    }
    image.onerror = () => resolve(dataUrl)
    image.src = dataUrl
  })
}

const refreshExportPreview = async () => {
  if (!drawStampUtils) return
  const requestId = ++exportPreviewRequestId
  const width = clampExportSize(exportWidth.value, Math.round(defaultExportWidth.value) || MIN_EXPORT_SIZE)
  const height = clampExportSize(exportHeight.value, Math.round(defaultExportHeight.value) || MIN_EXPORT_SIZE)
  try {
    let previewUrl = await drawStampUtils.getStampImageBase64(
      selectedFormat.value === 'jpeg' ? 'jpeg' : 'png',
      selectedFormat.value === 'jpeg' ? jpegQuality.value / 100 : 0.92,
      Math.round(width),
      Math.round(height)
    )
    if (selectedFormat.value === 'png' && useWhitePngBackground.value) {
      previewUrl = await addWhiteBackgroundToDataUrl(previewUrl)
    }
    if (requestId === exportPreviewRequestId) {
      exportPreviewUrl.value = previewUrl
    }
  } catch {
    if (requestId === exportPreviewRequestId) {
      exportPreviewUrl.value = ''
    }
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

  base.primaryColor = DEFAULT_STAMP_RED
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
  base.taxNumberList = []
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

  if (presetKey === 'official') {
    base.title = '公司公章'
    base.width = 42
    base.height = 42
    base.borderWidth = 1.1
    base.company = { ...commonCompany, fontHeight: 4.1, textDistributionFactor: 3.2 }
    base.companyList = [base.company]
    base.stampType = {
      ...stampTypeBase,
      stampType: '公章',
      fontHeight: 4.2,
      fontFamily: 'SimSun',
      fontWeight: 'bold',
      positionX: 0,
      positionY: -7,
      fontWidth: 3,
      color: base.primaryColor
    }
    base.stampTypeList = [base.stampType]
    base.drawStar = { ...base.drawStar, drawStar: true, starDiameter: 11.5, starPositionX: 0, starPositionY: 0, color: base.primaryColor }
    return base
  }

  if (presetKey === 'business') {
    base.title = '业务专用章'
    base.width = 40
    base.height = 40
    base.company = { ...commonCompany, fontHeight: 4, textDistributionFactor: 3.1 }
    base.companyList = [base.company]
    base.stampType = {
      ...stampTypeBase,
      stampType: '业务专用章',
      fontHeight: 4.1,
      fontFamily: 'SimSun',
      fontWeight: 'bold',
      positionX: 0,
      positionY: -7,
      fontWidth: 3,
      color: base.primaryColor
    }
    base.stampTypeList = [base.stampType]
    base.stampCode = {
      ...codeBase,
      code: '业务 000001',
      fontHeight: 1.2,
      borderOffset: 1.25,
      color: base.primaryColor
    }
    base.stampCodeList = [base.stampCode]
    base.drawStar = { ...base.drawStar, drawStar: true, starDiameter: 10, starPositionX: 0, starPositionY: -0.5, color: base.primaryColor }
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

  if (presetKey === 'receipt') {
    base.title = '收讫专用章'
    base.width = 44
    base.height = 30
    base.company = { ...commonCompany, fontHeight: 3.6, textDistributionFactor: 4.1 }
    base.companyList = [base.company]
    base.stampType = {
      ...stampTypeBase,
      stampType: '收讫',
      fontHeight: 5.2,
      fontFamily: 'SimSun',
      fontWeight: 'bold',
      positionY: -3,
      color: base.primaryColor
    }
    base.stampTypeList = [base.stampType]
    base.stampCode = {
      ...codeBase,
      code: '经办人  日期',
      fontHeight: 1.2,
      borderOffset: 1.15,
      color: base.primaryColor
    }
    base.stampCodeList = [base.stampCode]
    base.innerCircleList = [{
      ...base.innerCircle,
      drawInnerCircle: true,
      innerCircleLineWidth: 0.25,
      innerCircleLineRadiusX: 12,
      innerCircleLineRadiusY: 7.2,
      color: base.primaryColor,
      shape: 'ellipse'
    }]
    base.drawStar = { ...base.drawStar, drawStar: false, color: base.primaryColor }
    return base
  }

  if (presetKey === 'quotation') {
    base.title = '报价专用章'
    base.width = 46
    base.height = 30
    base.company = { ...commonCompany, fontHeight: 3.7, textDistributionFactor: 3.9 }
    base.companyList = [base.company]
    base.stampType = {
      ...stampTypeBase,
      stampType: '报价专用章',
      fontHeight: 4.2,
      fontFamily: 'SimSun',
      fontWeight: 'bold',
      positionY: -4,
      color: base.primaryColor
    }
    base.stampTypeList = [base.stampType]
    base.taxNumber = {
      ...base.taxNumber,
      code: '报价有效期 7 日',
      fontHeight: 1.8,
      positionY: 7.4,
      totalWidth: 26,
      color: base.primaryColor
    }
    base.taxNumberList = [base.taxNumber]
    base.innerCircleList = [{
      ...base.innerCircle,
      drawInnerCircle: true,
      innerCircleLineWidth: 0.25,
      innerCircleLineRadiusX: 13,
      innerCircleLineRadiusY: 8.2,
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
    code: '中间编号 000000000000000000',
    fontHeight: 2,
    positionY: 8,
    totalWidth: 32,
    color: base.primaryColor
  }
  base.taxNumberList = [base.taxNumber]
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

type LocalDraftItem = {
  id: string
  savedAt: number
  summary: string
  config: IDrawStampConfig
}

type LegacyLocalDraftPayload = {
  version: 1
  savedAt: number
  config: IDrawStampConfig
}

type LocalDraftPayload = {
  version: 2
  updatedAt: number
  drafts: LocalDraftItem[]
}

const cloneConfig = (config: IDrawStampConfig): IDrawStampConfig => {
  return JSON.parse(JSON.stringify(config)) as IDrawStampConfig
}

const buildDraftSummary = (config: IDrawStampConfig) => {
  const width = Math.round(Number(config.width) || 0)
  const height = Math.round(Number(config.height) || 0)
  const companyName =
    config.companyList?.find(item => item.companyName?.trim())?.companyName?.trim() ||
    config.company?.companyName?.trim()
  const stampType =
    config.stampTypeList?.find(item => item.stampType?.trim())?.stampType?.trim() ||
    config.stampType?.stampType?.trim()
  const title = companyName || stampType || '未命名印章'
  return `${title} · ${width} x ${height} mm`
}

const normalizeDraftList = (drafts: LocalDraftItem[]) => {
  return drafts
    .filter(draft => draft?.config && draft?.savedAt)
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, MAX_DRAFT_VERSIONS)
}

const readLocalDrafts = (): LocalDraftItem[] => {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as LocalDraftPayload | LegacyLocalDraftPayload

    if (parsed?.version === 2 && Array.isArray((parsed as LocalDraftPayload).drafts)) {
      return normalizeDraftList((parsed as LocalDraftPayload).drafts)
    }

    if (parsed?.version === 1 && (parsed as LegacyLocalDraftPayload).config) {
      const legacyDraft = parsed as LegacyLocalDraftPayload
      return [{
        id: `draft-${legacyDraft.savedAt}`,
        savedAt: legacyDraft.savedAt,
        summary: buildDraftSummary(legacyDraft.config),
        config: legacyDraft.config
      }]
    }

    return []
  } catch (error) {
    console.warn('读取本地草稿失败:', error)
    return []
  }
}

const writeLocalDrafts = (drafts: LocalDraftItem[]) => {
  const nextDrafts = normalizeDraftList(drafts)
  const payload: LocalDraftPayload = {
    version: 2,
    updatedAt: Date.now(),
    drafts: nextDrafts
  }
  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload))
  draftVersions.value = nextDrafts
  hasLocalDraft.value = nextDrafts.length > 0
  draftSavedAt.value = nextDrafts[0]?.savedAt ?? null
}

const saveLocalDraftNow = (config: IDrawStampConfig | null) => {
  if (!config || suppressDraftSave) return

  draftSaveState.value = 'saving'
  try {
    const savedAt = Date.now()
    const drafts = readLocalDrafts()
    const latestDraft = drafts[0]
    const nextDraft: LocalDraftItem = {
      id: latestDraft && savedAt - latestDraft.savedAt < DRAFT_VERSION_INTERVAL ? latestDraft.id : `draft-${savedAt}`,
      savedAt,
      summary: buildDraftSummary(config),
      config: cloneConfig(config)
    }
    const nextDrafts = latestDraft && nextDraft.id === latestDraft.id
      ? [nextDraft, ...drafts.slice(1)]
      : [nextDraft, ...drafts]
    writeLocalDrafts(nextDrafts)
    draftSavedAt.value = savedAt
    draftSaveState.value = 'saved'
    hasLocalDraft.value = true
  } catch (error) {
    console.warn('保存本地草稿失败:', error)
    draftSaveState.value = 'failed'
  }
}

const scheduleLocalDraftSave = (config: IDrawStampConfig | null) => {
  if (!config || suppressDraftSave) return
  if (draftSaveTimer) {
    window.clearTimeout(draftSaveTimer)
  }
  draftSaveState.value = 'saving'
  draftSaveTimer = window.setTimeout(() => {
    saveLocalDraftNow(config)
  }, DRAFT_SAVE_DELAY)
}

const clearLocalDraft = () => {
  suppressDraftSave = true
  if (draftSaveTimer) {
    window.clearTimeout(draftSaveTimer)
    draftSaveTimer = undefined
  }
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY)
  } catch (error) {
    console.warn('清除本地草稿失败:', error)
  }
  hasLocalDraft.value = false
  draftSavedAt.value = null
  draftVersions.value = []
  draftSaveState.value = 'idle'
  isDraftMenuOpen.value = false
  window.setTimeout(() => {
    suppressDraftSave = false
  }, DRAFT_SAVE_DELAY)
}

const retryDraftSave = () => {
  const config = stampStore.state.config
  if (!config) return
  saveLocalDraftNow(config)
}

const handleDraftStatusClick = () => {
  if (draftSaveState.value === 'failed') {
    retryDraftSave()
    return
  }
  isDraftMenuOpen.value = !isDraftMenuOpen.value
}

const restoreDraftVersion = async (draftId: string) => {
  const draft = draftVersions.value.find(item => item.id === draftId)
  if (!draft || !drawStampUtils) return

  suppressDraftSave = true
  const draftConfig = cloneConfig(draft.config)
  drawStampUtils.setDrawConfigs(draftConfig)
  stampStore.setConfig(draftConfig)
  syncConfigToParent()
  exportFilename.value = buildExportFilename(draftConfig)
  drawStamp()
  draftSavedAt.value = draft.savedAt
  draftSaveState.value = 'saved'
  isDraftMenuOpen.value = false

  await nextTick()
  propertiesPanelRef.value?.restoreDrawConfigs()
  window.setTimeout(() => {
    suppressDraftSave = false
  }, DRAFT_SAVE_DELAY)
}

const handleGlobalClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  if (!target?.closest?.('.draft-menu-wrap')) {
    isDraftMenuOpen.value = false
  }
}

const handleBeforeUnload = () => {
  if (draftSaveTimer) {
    window.clearTimeout(draftSaveTimer)
    draftSaveTimer = undefined
  }
  saveLocalDraftNow(stampStore.state.config)
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
    stampStore.setConfig(cloneConfig(config))
    syncConfigToParent()
    updateViewState()
  })

  // 如果父组件传入了模板配置，优先使用该配置初始化
  if (props.modelValue) {
    const initialConfig = cloneConfig(props.modelValue)
    drawStampUtils.setDrawConfigs(initialConfig)
    stampStore.setConfig(initialConfig)
  } else {
    const drafts = readLocalDrafts()
    draftVersions.value = drafts
    const draft = drafts[0]
    if (draft) {
      const draftConfig = cloneConfig(draft.config)
      drawStampUtils.setDrawConfigs(draftConfig)
      stampStore.setConfig(draftConfig)
      draftSavedAt.value = draft.savedAt
      draftSaveState.value = 'saved'
      hasLocalDraft.value = true
    } else {
      stampStore.setConfig(drawStampUtils.getDrawConfigs())
      hasLocalDraft.value = false
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
  refreshExportPreview()

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

watch([selectedFormat, jpegQuality, useWhitePngBackground], () => {
  if (showFormatDialog.value) {
    refreshExportPreview()
  }
})

watch(
  () => stampStore.state.config,
  (config) => {
    scheduleLocalDraftSave(config)
  },
  { deep: true }
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

  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('click', handleGlobalClick)
  drawStampUtils?.canvas?.addEventListener('click', handleCanvasClick)
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
  handleBeforeUnload()
  window.removeEventListener('beforeunload', handleBeforeUnload)
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

.seo-content {
  position: relative;
  isolation: isolate;
  width: 100%;
  margin: 18px 0 4px;
  padding: clamp(18px, 3vw, 34px);
  box-sizing: border-box;
  text-align: left;
  background:
    radial-gradient(circle at 8% 12%, rgba(255, 255, 255, 0.88), transparent 28%),
    linear-gradient(135deg, rgba(35, 76, 92, 0.055) 0 1px, transparent 1px 100%),
    linear-gradient(180deg, #fffefa 0%, #f5f6f0 100%);
  background-size: auto, 20px 20px, auto;
  border: 1px solid var(--studio-line);
  border-radius: 14px;
  box-shadow: var(--studio-shadow-panel);
  overflow: hidden;
}

.seo-content::after {
  content: '';
  position: absolute;
  top: 22px;
  right: 24px;
  z-index: -1;
  width: clamp(76px, 11vw, 132px);
  height: clamp(76px, 11vw, 132px);
  border: 2px solid rgba(255, 0, 21, 0.12);
  border-radius: 50%;
  box-shadow: inset 0 0 0 10px rgba(255, 0, 21, 0.035);
}

.seo-hero {
  max-width: 880px;
}

.seo-eyebrow {
  margin: 0 0 10px;
  color: var(--studio-tool-blue);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.seo-content h2,
.seo-content h3,
.seo-content p {
  margin-top: 0;
}

.seo-content h2 {
  color: var(--studio-ink);
  font-size: clamp(24px, 3vw, 38px);
  line-height: 1.16;
  letter-spacing: -0.04em;
}

.seo-content p {
  color: var(--studio-muted);
  font-size: 15px;
  line-height: 1.8;
}

.seo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.seo-meta span {
  padding: 7px 10px;
  color: var(--studio-tool-blue);
  background: rgba(232, 242, 245, 0.86);
  border: 1px solid rgba(46, 111, 143, 0.14);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
}

.seo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.seo-grid article,
.seo-faq {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid var(--studio-line-hair);
  border-radius: 12px;
  box-shadow: var(--studio-shadow-quiet);
}

.seo-grid article {
  position: relative;
  padding: 18px;
}

.seo-grid span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 24px;
  margin-bottom: 12px;
  color: var(--studio-tool-blue);
  background: rgba(232, 242, 245, 0.72);
  border: 1px solid rgba(46, 111, 143, 0.12);
  border-radius: 7px;
  font-size: 12px;
  font-weight: 800;
}

.seo-grid h3 {
  margin-bottom: 8px;
  color: var(--studio-ink);
  font-size: 17px;
}

.seo-grid p {
  margin-bottom: 0;
  font-size: 14px;
}

.seo-faq {
  margin-top: 14px;
  padding: 18px;
}

.seo-faq h2 {
  margin-bottom: 14px;
  font-size: 22px;
  letter-spacing: -0.02em;
}

.seo-faq details {
  border-top: 1px solid var(--studio-line-hair);
  padding: 12px 0;
}

.seo-faq details:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.seo-faq details:last-of-type {
  padding-bottom: 0;
}

.seo-faq summary {
  cursor: pointer;
  color: var(--studio-ink);
  font-weight: 700;
}

.seo-faq details p {
  margin: 10px 0 0;
}

.seo-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.seo-links a {
  padding: 8px 12px;
  color: var(--studio-tool-blue);
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid var(--studio-line);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}

.seo-links a:hover {
  color: #ffffff;
  background: var(--studio-tool-blue);
  border-color: var(--studio-tool-blue);
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

.export-dialog {
  width: min(920px, calc(100vw - 40px));
  max-width: none;
  padding: 0;
  border: 1px solid var(--studio-line-strong);
  border-radius: 14px;
  background: var(--studio-panel);
  overflow: hidden;
  box-shadow: 0 26px 80px rgba(32, 37, 34, 0.28);
}

.export-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 64px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--studio-line);
  background: linear-gradient(180deg, #fffefa, #f7f8f3);
}

.export-dialog-header h3 {
  margin: 1px 0 0;
  color: var(--studio-ink);
  font-size: 20px;
  line-height: 1.2;
}

.export-eyebrow {
  display: block;
  color: var(--studio-muted);
  font-size: 10px;
  line-height: 1.3;
  letter-spacing: 0;
  font-weight: 800;
}

.export-close-button {
  width: 30px;
  height: 30px;
  padding: 0;
  box-sizing: border-box;
  flex: 0 0 30px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--studio-muted);
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.export-close-button:hover {
  background: #f7eeee;
  color: var(--studio-ui-red-deep);
  transform: translateY(-1px);
}

.export-dialog-content {
  display: grid;
  grid-template-columns: minmax(260px, 0.86fr) minmax(360px, 1fr);
  gap: 0;
  margin: 0;
}

.export-preview-panel,
.export-settings-panel {
  min-width: 0;
  padding: 18px;
}

.export-preview-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-right: 1px solid var(--studio-line);
  background:
    linear-gradient(#e5e9e0 1px, transparent 1px),
    linear-gradient(90deg, #e5e9e0 1px, transparent 1px);
  background-color: #f4f5f1;
  background-size: 24px 24px;
}

.export-preview-card {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: var(--studio-panel);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), var(--studio-shadow-panel);
  overflow: hidden;
}

.export-preview-card.checker {
  background:
    linear-gradient(45deg, #edf1f5 25%, transparent 25%),
    linear-gradient(-45deg, #edf1f5 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #edf1f5 75%),
    linear-gradient(-45deg, transparent 75%, #edf1f5 75%);
  background-color: #ffffff;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
  background-size: 20px 20px;
}

.export-preview-card img {
  max-width: 86%;
  max-height: 260px;
  object-fit: contain;
  filter: drop-shadow(0 10px 18px rgba(37, 48, 68, 0.08));
}

.export-preview-empty {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
}

.skeleton-stamp {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: var(--studio-panel-muted);
  border: 1px solid var(--studio-line);
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.export-preview-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
}

.export-preview-meta strong,
.export-preview-meta span {
  white-space: nowrap;
}

.export-preview-meta strong {
  color: var(--studio-ink);
  font-size: 13px;
}

.export-preview-meta span {
  color: var(--studio-muted);
  font-size: 12px;
}

.export-settings-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.export-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.export-section-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.export-section-title label {
  color: var(--studio-ink);
  font-size: 13px;
  font-weight: 800;
}

.export-section-title span {
  color: var(--studio-muted);
  font-size: 12px;
}

.export-dialog .format-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 0;
}

.export-dialog .format-button {
  min-width: 0;
  min-height: 78px;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: linear-gradient(180deg, #fffefa, #f7f8f3);
  color: var(--studio-ink);
  position: relative;
}

.export-dialog .format-button:hover,
.export-dialog .format-button.active {
  border-color: var(--studio-ui-red);
  background: #fff8f6;
  box-shadow: 0 0 0 2px rgba(163, 58, 50, 0.08);
}

.export-dialog .format-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  background: #f7eeee;
  color: var(--studio-ui-red);
  font-size: 12px;
  font-weight: 900;
}

.export-dialog .format-name,
.export-dialog .format-desc {
  display: block;
}

.export-dialog .format-name {
  min-width: 0;
  color: var(--studio-ink);
  font-size: 14px;
}

.export-dialog .format-desc {
  margin-top: 3px;
  color: var(--studio-muted);
  font-size: 11px;
  line-height: 1.35;
}

.export-dialog .format-button em {
  position: absolute;
  right: 8px;
  top: 8px;
  padding: 2px 5px;
  border-radius: 999px;
  background: #f7eeee;
  color: var(--studio-ui-red);
  font-size: 10px;
  font-style: normal;
  font-weight: 800;
}

.export-dialog .quality-setting {
  margin: 0;
  padding: 12px;
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: #fbfaf6;
}

.export-dialog .quality-setting label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--studio-ink);
  font-weight: 700;
}

.export-dialog .quality-slider::-webkit-slider-thumb,
.export-dialog .quality-slider::-moz-range-thumb {
  background: var(--studio-ui-red);
}

.export-dialog .quality-slider {
  background: var(--studio-line);
}

.export-dialog .scale-options {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.export-dialog .scale-button {
  min-height: 36px;
}

.export-dialog .export-checkbox {
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: #fbfaf6;
  color: var(--studio-ink);
}

.export-dialog .export-name-input {
  height: 38px;
}

.export-advanced {
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: #fbfaf6;
  overflow: hidden;
}

.export-advanced summary {
  padding: 12px;
  color: var(--studio-ink);
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  list-style-position: inside;
}

.export-advanced .size-setting {
  margin: 0;
  padding: 0 12px 12px;
  border-top: 1px solid var(--studio-line);
}

.export-dialog .size-setting-header {
  margin-bottom: 10px;
}

.export-dialog .size-field input {
  border-color: var(--studio-line);
  background: var(--studio-panel);
  color: var(--studio-ink);
}

.export-dialog .size-field input:focus {
  border-color: rgba(35, 76, 92, 0.48);
  box-shadow: var(--studio-focus);
}

.export-dialog .size-reset {
  padding: 4px 8px;
  border: 1px solid var(--studio-line);
  border-radius: 999px;
  background: var(--studio-panel);
  color: var(--studio-tool-blue);
  font-weight: 700;
}

.export-dialog .size-reset:hover {
  border-color: rgba(35, 76, 92, 0.38);
  background: var(--studio-tool-blue-soft);
  color: var(--studio-tool-blue);
  text-decoration: none;
}

.export-dialog .ratio-options {
  gap: 6px;
}

.export-dialog .ratio-button {
  border-color: var(--studio-line);
  background: var(--studio-panel);
  color: var(--studio-muted);
  font-weight: 650;
}

.export-dialog .ratio-button:hover {
  border-color: rgba(35, 76, 92, 0.38);
  background: var(--studio-tool-blue-soft);
  color: var(--studio-tool-blue);
}

.export-dialog .ratio-button.active {
  border-color: rgba(163, 58, 50, 0.42);
  background: #fff3f0;
  color: var(--studio-ui-red);
  box-shadow: 0 0 0 2px rgba(163, 58, 50, 0.08);
}

.export-dialog .dialog-buttons {
  margin-top: 0;
  padding: 14px 18px;
  border-top: 1px solid var(--studio-line);
  background: #f7f8f3;
}

.export-dialog .cancel-button,
.export-dialog .confirm-button {
  min-width: 96px;
  min-height: 36px;
  border-radius: 7px;
  font-weight: 700;
}

.export-dialog .cancel-button {
  border: 1px solid var(--studio-line);
  background: var(--studio-panel);
  color: var(--studio-muted);
}

.export-dialog .cancel-button:hover {
  border-color: var(--studio-line-strong);
  background: #f7f8f3;
  color: var(--studio-ink);
}

.export-dialog .confirm-button {
  border: 1px solid var(--studio-ui-red);
  background: var(--studio-ui-red);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(132, 43, 38, 0.18);
}

.export-dialog .confirm-button:hover {
  background: var(--studio-ui-red-deep);
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
  border: 1px solid var(--studio-line);
  border-radius: 7px;
  background: var(--studio-panel);
  color: var(--studio-ink);
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.scale-button:hover,
.scale-button.active {
  border-color: var(--studio-ui-red);
  background: #fff5f3;
  color: var(--studio-ui-red);
}

.export-checkbox {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.export-checkbox input {
  accent-color: var(--studio-ui-red);
}

.export-name-input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid var(--studio-line);
  border-radius: 7px;
  color: var(--studio-ink);
  font-size: 14px;
}

.export-name-input:focus {
  border-color: var(--studio-ui-red);
  box-shadow: 0 0 0 3px rgba(163, 58, 50, 0.12);
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
