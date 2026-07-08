<template>
  <div class="properties-panel">
    <div class="panel-header">
      <div>
        <span class="panel-eyebrow">{{ panelModeLabel }}</span>
        <h3>{{ t('common.properties.title') }}</h3>
      </div>
      <span class="selection-pill">{{ selectedLabel }}</span>
    </div>
    <div class="inspector-summary">
      <div class="summary-main">
        <span class="summary-icon" :class="`summary-${elementType || 'basic'}`">{{ selectedIcon }}</span>
        <div>
          <strong>{{ selectedLabel }}</strong>
        </div>
      </div>
      <div class="summary-stats">
        <span>
          <small>尺寸</small>
          <strong>{{ stampSizeLabel }}</strong>
        </span>
        <span>
          <small>形状</small>
          <strong>{{ shapeLabel }}</strong>
        </span>
        <span>
          <small>元素</small>
          <strong>{{ elementCount }}</strong>
        </span>
      </div>
      <div class="summary-color-row">
        <span>印章色</span>
        <i :style="{ backgroundColor: primaryColor }"></i>
        <strong>{{ primaryColorLabel }}</strong>
      </div>
    </div>
    <div class="panel-content">
      <div v-if="showCategoryControls" class="settings-segment" role="tablist" aria-label="属性设置分类">
        <button
          type="button"
          :class="{ active: activeSettingsTab === 'basic' }"
          role="tab"
          :aria-selected="activeSettingsTab === 'basic'"
          @click="switchSettingsTab('basic')"
        >
          基础设置
        </button>
        <button
          type="button"
          :class="{ active: activeSettingsTab === 'advanced' }"
          role="tab"
          :aria-selected="activeSettingsTab === 'advanced'"
          @click="switchSettingsTab('advanced')"
        >
          高级设置
        </button>
      </div>
      <div v-else class="context-focus-strip">
        <span>当前对象参数</span>
        <button type="button" @click="handleCollapseContext">回到基础</button>
      </div>
      <EditorControls
        v-if="drawStampUtils"
        ref="editorControlsRef"
        :drawStampUtils="drawStampUtils"
        :selected-element-type="elementType"
        :selected-element-index="elementIndex"
        :show-all="showCategoryControls"
        :settings-category="activeSettingsTab"
        @updateDrawStamp="handleUpdateDrawStamp"
        @collapseContext="handleCollapseContext"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import EditorControls from '../../EditorControls.vue'
import { IDrawStampConfig } from '../../DrawStampTypes'
import { useStampStore } from '../../stores/stampStore'
import { DEFAULT_STAMP_RED } from '../../Constants'

const { t } = useI18n()

interface Props {
  drawStampUtils: any
  selectedElement?: string
  elementType?: string
  elementIndex?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'updateDrawStamp', config: IDrawStampConfig, refreshSecurityPattern: boolean, refreshOld: boolean, refreshRoughEdge: boolean): void
  (e: 'clearSelection'): void
}>()

const editorControlsRef = ref<InstanceType<typeof EditorControls> | null>(null)
const stampStore = useStampStore()
const activeSettingsTab = ref<'basic' | 'advanced'>('basic')

const showFullControls = computed(() => !props.elementType || props.elementType === 'basic')
const showCategoryControls = computed(() => showFullControls.value)

const advancedElementTypes = new Set(['image', 'svg', 'line', 'security', 'roughEdge', 'aging'])

watch(
  () => props.elementType,
  (type) => {
    activeSettingsTab.value = type && advancedElementTypes.has(type) ? 'advanced' : 'basic'
  },
  { immediate: true }
)

const currentConfig = computed<IDrawStampConfig | null>(() => {
  return stampStore.state.config || props.drawStampUtils?.getDrawConfigs?.() || null
})

const selectedLabel = computed(() => {
  const typeMap: Record<string, string> = {
    basic: '基础',
    company: '公司文字',
    stampType: '印章类型',
    code: '编码',
    taxNumber: '中间文字',
    star: '中心图形',
    circle: '内圆',
    image: '图片',
    svg: 'SVG',
    aging: '做旧',
    roughEdge: '毛边',
    security: '防伪',
    line: '线条'
  }
  const label = typeMap[props.elementType || 'basic'] || '对象'
  const indexLabel = props.elementIndex && props.elementIndex > 0 ? ` ${props.elementIndex + 1}` : ''
  return `${label}${indexLabel}`
})

const panelModeLabel = computed(() => (showCategoryControls.value ? 'Overview' : 'Context'))

const switchSettingsTab = (tab: 'basic' | 'advanced') => {
  activeSettingsTab.value = tab
}

const selectedIcon = computed(() => {
  const iconMap: Record<string, string> = {
    basic: '基',
    company: '文',
    stampType: '类',
    code: '码',
    taxNumber: '中',
    star: '星',
    circle: '圆',
    image: '图',
    svg: 'SVG',
    aging: '旧',
    roughEdge: '边',
    security: '防',
    line: '线'
  }
  return iconMap[props.elementType || 'basic'] || '项'
})

const stampSizeLabel = computed(() => {
  const config = currentConfig.value
  if (!config) return '--'
  return `${Number(config.width || 0).toFixed(0)} x ${Number(config.height || 0).toFixed(0)} mm`
})

const shapeLabel = computed(() => {
  const shape = currentConfig.value?.company?.shape || 'ellipse'
  const labels: Record<string, string> = {
    ellipse: '椭圆/圆形',
    rectangle: '矩形',
    rhombus: '菱形',
    triangle: '三角形',
    organic: '不规则'
  }
  return labels[shape] || '自定义'
})

const elementCount = computed(() => {
  const config = currentConfig.value
  if (!config) return 0
  const counts = [
    config.companyList?.length || 0,
    config.stampTypeList?.length || 0,
    config.stampCodeList?.length || 0,
    config.taxNumberList?.length || (config.taxNumber?.code ? 1 : 0),
    config.drawStar?.drawStar ? 1 : 0,
    config.innerCircleList?.length || 0,
    config.imageList?.length || 0,
    config.svgList?.length || 0,
    config.lineList?.length || 0,
    config.agingEffect?.applyAging ? 1 : 0,
    config.roughEdge?.drawRoughEdge ? 1 : 0,
    config.securityPattern?.openSecurityPattern ? 1 : 0
  ]
  return counts.reduce((sum, value) => sum + value, 0)
})

const primaryColor = computed(() => currentConfig.value?.primaryColor || DEFAULT_STAMP_RED)
const primaryColorLabel = computed(() => {
  const value = primaryColor.value.trim()
  return value.startsWith('#') ? value.toUpperCase() : '自定义色'
})

const handleUpdateDrawStamp = (
  config: IDrawStampConfig,
  refreshSecurityPattern: boolean,
  refreshOld: boolean,
  refreshRoughEdge: boolean
) => {
  emit('updateDrawStamp', config, refreshSecurityPattern, refreshOld, refreshRoughEdge)
}

const handleCollapseContext = () => {
  emit('clearSelection')
}

// 元素类型变化时，EditorControls 会根据 selectedElementType 自动显示/隐藏对应的 control-group
// 这里不需要额外的处理逻辑

// 暴露方法供父组件调用
defineExpose({
  restoreDrawConfigs: () => {
    editorControlsRef.value?.restoreDrawConfigs()
  },
  scrollToCompanyText: (index: number) => {
    editorControlsRef.value?.scrollToCompanyText(index)
  },
  scrollToCode: () => {
    editorControlsRef.value?.scrollToCode()
  },
  scrollToStampType: (index: number) => {
    editorControlsRef.value?.scrollToStampType(index)
  },
  scrollToTaxNumber: () => {
    editorControlsRef.value?.scrollToTaxNumber()
  }
})
</script>

<style scoped>
.properties-panel {
  width: 352px;
  min-width: 352px;
  background: var(--studio-panel);
  border-left: 1px solid var(--studio-line-hair);
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 0;
  overflow: hidden;
}

.panel-header {
  min-height: 54px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--studio-line-hair);
  background:
    linear-gradient(180deg, rgba(255, 254, 250, 0.98), rgba(248, 249, 245, 0.98));
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.panel-eyebrow {
  display: block;
  margin-bottom: 2px;
  color: var(--studio-muted);
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.panel-header h3 {
  margin: 0;
  font-size: 15px;
  line-height: 1.3;
  font-weight: 700;
  color: var(--studio-ink);
}

.selection-pill {
  max-width: 130px;
  padding: 5px 9px;
  border: 1px solid var(--studio-line);
  border-radius: 999px;
  background: #f2f4ef;
  color: var(--studio-muted);
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inspector-summary {
  margin: 10px 12px 0;
  padding: 10px;
  border: 1px solid var(--studio-line-hair);
  border-radius: 10px;
  background:
    linear-gradient(180deg, rgba(255, 254, 250, 0.98), rgba(247, 248, 243, 0.98));
  box-shadow: var(--studio-shadow-quiet);
  flex-shrink: 0;
}

.summary-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.summary-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  background: #f7eeee;
  color: var(--studio-ui-red);
  font-size: 13px;
  line-height: 1;
  font-weight: 800;
}

.summary-svg {
  font-size: 10px;
}

.summary-main strong {
  display: block;
  min-width: 0;
}

.summary-main strong {
  color: var(--studio-ink);
  font-size: 14px;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  margin-top: 9px;
}

.summary-stats span {
  min-width: 0;
  padding: 6px 7px;
  border: 1px solid var(--studio-line-hair);
  border-radius: 7px;
  background: var(--studio-panel);
}

.summary-stats small,
.summary-stats strong {
  display: block;
  min-width: 0;
}

.summary-stats small {
  color: var(--studio-muted);
  font-size: 10px;
  line-height: 1.2;
}

.summary-stats strong {
  margin-top: 3px;
  color: var(--studio-ink);
  font-size: 12px;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-color-row {
  margin-top: 8px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  color: var(--studio-muted);
  font-size: 12px;
  line-height: 1.2;
}

.summary-color-row i {
  height: 10px;
  border-radius: 999px;
  border: 1px solid rgba(32, 39, 51, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.summary-color-row strong {
  color: var(--studio-ink);
  font-size: 11px;
  font-weight: 700;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  background:
    linear-gradient(180deg, rgba(242, 244, 239, 0.94), rgba(238, 241, 234, 0.94));
  scrollbar-width: thin;
  scrollbar-color: var(--studio-line-strong) transparent;
}

.settings-segment {
  margin: 10px 14px 0;
  padding: 3px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3px;
  border: 1px solid var(--studio-line-hair);
  border-radius: 9px;
  background: #e8ece4;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.settings-segment button {
  min-width: 0;
  height: 30px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--studio-muted);
  font-size: 12px;
  line-height: 1;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;
}

.settings-segment button:hover {
  color: var(--studio-ink);
}

.settings-segment button.active {
  background: #ffffff;
  color: var(--studio-ui-red);
  box-shadow:
    0 1px 2px rgba(31, 41, 55, 0.08),
    0 0 0 1px rgba(163, 58, 50, 0.08);
}

.context-focus-strip {
  margin: 10px 14px 0;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid var(--studio-line-hair);
  border-radius: 9px;
  background: var(--studio-panel);
  color: var(--studio-muted);
  font-size: 12px;
  line-height: 1.2;
  font-weight: 700;
}

.context-focus-strip button {
  flex: 0 0 auto;
  height: 26px;
  padding: 0 9px;
  border: 1px solid var(--studio-line);
  border-radius: 6px;
  background: #f7f8f3;
  color: var(--studio-ink);
  font-size: 12px;
  line-height: 1;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.context-focus-strip button:hover {
  border-color: rgba(163, 58, 50, 0.28);
  background: #fff5f3;
  color: var(--studio-ui-red);
}

.panel-content :deep(.control-group) {
  margin: 10px 12px;
  border-color: var(--studio-line-hair);
  background: rgba(255, 254, 250, 0.92);
  box-shadow: none;
}

.panel-content :deep(.control-group:hover) {
  box-shadow: var(--studio-shadow-quiet);
}

.panel-content :deep(.control-group h3),
.panel-content :deep(.group-header h3) {
  color: var(--studio-ink);
  border-bottom-color: var(--studio-line-hair);
}

.panel-content :deep(input[type="text"]),
.panel-content :deep(input[type="number"]),
.panel-content :deep(input[type="email"]),
.panel-content :deep(input[type="search"]),
.panel-content :deep(textarea),
.panel-content :deep(select),
.panel-content :deep(.font-input),
.panel-content :deep(.font-select),
.panel-content :deep(.text-input-field) {
  border-color: var(--studio-line);
  border-radius: 7px;
  background: var(--studio-panel);
  color: var(--studio-ink);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.panel-content :deep(input[type="text"]:focus),
.panel-content :deep(input[type="number"]:focus),
.panel-content :deep(input[type="email"]:focus),
.panel-content :deep(input[type="search"]:focus),
.panel-content :deep(textarea:focus),
.panel-content :deep(select:focus),
.panel-content :deep(.font-input:focus),
.panel-content :deep(.font-select:focus),
.panel-content :deep(.text-input-field:focus) {
  border-color: rgba(35, 76, 92, 0.38);
  box-shadow: var(--studio-focus);
  outline: none;
}

.panel-content :deep(input[type="range"]) {
  accent-color: var(--studio-ui-red);
}

.panel-content :deep(input[type="checkbox"]) {
  accent-color: var(--studio-ui-red);
}

.panel-content :deep(.range-item),
.panel-content :deep(.text-input-item),
.panel-content :deep(.checkbox-label),
.panel-content :deep(.inline-label) {
  border-color: var(--studio-line-hair);
  background: rgba(255, 254, 250, 0.72);
}

.panel-content :deep(.range-value-display) {
  color: var(--studio-tool-blue);
  background: var(--studio-tool-blue-soft);
}

.panel-content :deep(.range-btn) {
  border-color: var(--studio-line);
  background: var(--studio-panel);
  color: var(--studio-muted);
}

.panel-content :deep(.range-btn:hover) {
  border-color: rgba(35, 76, 92, 0.34);
  background: var(--studio-tool-blue-soft);
  color: var(--studio-tool-blue);
}

@media (max-width: 900px) {
  .properties-panel {
    width: 100%;
    min-width: 0;
    max-height: 520px;
    border-left: none;
    border-top: 1px solid var(--studio-line-hair);
  }
}
</style>
