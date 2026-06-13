<template>
  <div class="element-list-panel">
    <div class="panel-header">
      <h3>{{ t('elementList.title') }}</h3>
    </div>
    <div class="panel-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-button', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="panel-content">
      <!-- 全部元素 -->
      <div v-show="activeTab === 'all'" class="element-category">
        <div class="element-item"
             :class="{ active: selectedElement === 'basic-settings' }"
             @click.stop="selectElement('basic-settings', 'basic', 0)">
          <span class="element-icon">基</span>
          <span class="element-name">{{ t('elementList.elements.basicSettings') }}</span>
        </div>
        <div class="element-item"
             v-for="(company, index) in companyList"
             :key="`company-${index}`"
             :class="{ active: selectedElement === `company-${index}` }"
             @click.stop="selectElement(`company-${index}`, 'company', index)">
          <span class="element-icon">文</span>
          <span class="element-name">
            {{ company.companyName || t('elementList.defaults.companyNameIndex', { index: index + 1 }) }}
          </span>
<!--          <span class="element-type">{{ company.shape === 'rectangle' ? '矩形' : '椭圆' }}</span>-->
          <div class="element-actions" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('company', index)" :title="t('elementList.buttons.delete')">×</button>
          </div>
        </div>
        <div class="element-item"
             v-for="(type, index) in stampTypeList"
             :key="`stampType-${index}`"
             :class="{ active: selectedElement === `stampType-${index}` }"
             @click.stop="selectElement(`stampType-${index}`, 'stampType', index)">
          <span class="element-icon">类</span>
          <span class="element-name">
            {{ type.stampType || t('elementList.defaults.stampTypeIndex', { index: index + 1 }) }}
          </span>
<!--          <span class="element-type">类型</span>-->
          <div class="element-actions" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('stampType', index)" :title="t('elementList.buttons.delete')">×</button>
          </div>
        </div>
        <div
          class="element-item"
          v-for="(code, index) in stampCodeList"
          :key="`code-${index}`"
          :class="{ active: selectedElement === `code-${index}` }"
          @click.stop="selectElement(`code-${index}`, 'code', index)"
        >
          <span class="element-icon">码</span>
          <span
            class="element-name"
          >
            {{ code.code || t('elementList.elements.code') + ' ' + (index + 1) }}
          </span>
          <div class="element-actions show-always" @click.stop>
            <button
              class="action-btn delete-btn"
              @click="deleteElement('code', index)"
              title="删除"
            >×</button>
          </div>
        </div>
        <div
          class="element-item"
          v-for="(item, index) in taxNumberList"
          :key="`taxNumber-${index}`"
          :class="{ active: selectedElement === `taxNumber-${index}` }"
          @click.stop="selectElement(`taxNumber-${index}`, 'taxNumber', index)"
        >
          <span class="element-icon">中</span>
          <span class="element-name">
            {{ item.code || t('elementList.elements.taxNumber') + ' ' + (index + 1) }}
          </span>
          <div class="element-actions show-always" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('taxNumber', index)" title="删除">×</button>
          </div>
        </div>
        <div class="element-item"
             v-if="drawStar.drawStar"
             :class="{ active: selectedElement === 'star' }"
             @click.stop="selectElement('star', 'star', 0)">
          <span class="element-icon">星</span>
          <span class="element-name">{{ t('elementList.elements.star') }}</span>
          <span class="element-type">{{ drawStar.drawStar ? t('elementList.status.enabled') : t('elementList.status.disabled') }}</span>
          <div class="element-actions show-always" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('star', 0)" :title="t('elementList.buttons.delete')">×</button>
          </div>
        </div>
        <div class="element-item"
             v-for="(_, index) in innerCircleList"
             :key="`circle-all-${index}`"
             :class="{ active: selectedElement === `circle-${index}` }"
             @click.stop="selectElement(`circle-${index}`, 'circle', index)">
          <span class="element-icon">圆</span>
          <span class="element-name">{{ t('elementList.defaults.innerCircleIndex', { index: index + 1 }) }}</span>
          <div class="element-actions show-always" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('circle', index)" title="删除">×</button>
          </div>
        </div>
        <div class="element-item"
             v-for="imageInfo in visibleImages"
             :key="`image-${imageInfo.index}`"
             :class="{ active: selectedElement === `image-${imageInfo.index}` }"
             @click.stop="selectElement(`image-${imageInfo.index}`, 'image', imageInfo.index)">
          <span class="element-icon">图</span>
          <span class="element-name">{{ t('elementList.defaults.imageIndex', { index: imageInfo.index + 1 }) }}</span>
          <div class="element-actions show-always" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('image', imageInfo.index)" title="删除">×</button>
          </div>
        </div>
        <div class="element-item"
             v-for="(line, index) in lineList"
             :key="line.id || `line-${index}`"
             :class="{ active: selectedElement === `line-${index}` }"
             @click.stop="selectElement(`line-${index}`, 'line', index)">
          <span class="element-icon">{{ line.type === 'vertical' ? '纵' : '横' }}</span>
          <span class="element-name">{{ line.type === 'vertical' ? t('elementList.defaults.verticalLineIndex', { index: index + 1 }) : t('elementList.defaults.horizontalLineIndex', { index: index + 1 }) }}</span>
          <div class="element-actions show-always" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('line', index)" title="删除">×</button>
          </div>
        </div>
        <div class="element-item"
             v-for="(svg, index) in svgList"
             :key="`svg-all-${svg.id || index}`"
             :class="{ active: selectedElement === `svg-${index}` }"
             @click.stop="selectElement(`svg-${index}`, 'svg', index)">
          <span class="element-icon wide">SVG</span>
          <span class="element-name">{{ svg.name || t('elementList.defaults.svgIndex', { index: index + 1 }) }}</span>
          <div class="element-actions show-always" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('svg', index)" title="删除">×</button>
          </div>
        </div>
        <div class="element-item"
             v-if="agingEffect.applyAging"
             :class="{ active: selectedElement === 'aging' }"
             @click.stop="selectElement('aging', 'aging', 0)">
          <span class="element-icon">旧</span>
          <span class="element-name">{{ t('elementList.elements.agingEffect') }}</span>
          <span class="element-type">{{ agingEffect.applyAging ? t('elementList.status.enabled') : t('elementList.status.disabled') }}</span>
        </div>
        <div class="element-item"
             v-if="roughEdge.drawRoughEdge"
             :class="{ active: selectedElement === 'roughEdge' }"
             @click.stop="selectElement('roughEdge', 'roughEdge', 0)">
          <span class="element-icon">边</span>
          <span class="element-name">{{ t('elementList.elements.roughEdge') }}</span>
          <span class="element-type">{{ roughEdge.drawRoughEdge ? t('elementList.status.enabled') : t('elementList.status.disabled') }}</span>
        </div>
        <div class="element-item"
             v-if="securityPattern.openSecurityPattern"
             :class="{ active: selectedElement === 'security' }"
             @click.stop="selectElement('security', 'security', 0)">
          <span class="element-icon">防</span>
          <span class="element-name">{{ t('elementList.elements.securityPattern') }}</span>
          <span class="element-type">{{ securityPattern.openSecurityPattern ? t('elementList.status.enabled') : t('elementList.status.disabled') }}</span>
        </div>
      </div>

      <!-- 文字元素 -->
      <div v-show="activeTab === 'text'" class="element-category">
        <div class="element-item"
             v-for="(company, index) in companyList"
             :key="`company-${index}`"
             :class="{ active: selectedElement === `company-${index}` }"
             @click.stop="selectElement(`company-${index}`, 'company', index)">
          <span class="element-icon">文</span>
          <span class="element-name">
            {{ company.companyName || t('elementList.defaults.companyNameIndex', { index: index + 1 }) }}
          </span>
          <div class="element-actions" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('company', index)" :title="t('elementList.buttons.delete')">×</button>
          </div>
        </div>
        <div class="element-item"
             v-for="(type, index) in stampTypeList"
             :key="`stampType-${index}`"
             :class="{ active: selectedElement === `stampType-${index}` }"
             @click.stop="selectElement(`stampType-${index}`, 'stampType', index)">
          <span class="element-icon">类</span>
          <span class="element-name">
            {{ type.stampType || t('elementList.defaults.stampTypeIndex', { index: index + 1 }) }}
          </span>
          <div class="element-actions" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('stampType', index)" :title="t('elementList.buttons.delete')">×</button>
          </div>
        </div>
        <div
          class="element-item"
          v-for="(code, index) in stampCodeList"
          :key="`code-text-${index}`"
          :class="{ active: selectedElement === `code-${index}` }"
          @click.stop="selectElement(`code-${index}`, 'code', index)"
        >
          <span class="element-icon">码</span>
          <span
            class="element-name"
          >
            {{ code.code || t('elementList.elements.code') + ' ' + (index + 1) }}
          </span>
        </div>
        <div
          class="element-item"
          v-for="(item, index) in taxNumberList"
          :key="`taxNumber-text-${index}`"
          :class="{ active: selectedElement === `taxNumber-${index}` }"
          @click.stop="selectElement(`taxNumber-${index}`, 'taxNumber', index)"
        >
          <span class="element-icon">中</span>
          <span class="element-name">
            {{ item.code || t('elementList.elements.taxNumber') + ' ' + (index + 1) }}
          </span>
        </div>
        <p v-if="textElementCount === 0" class="empty-state">暂无文字元素</p>
      </div>

      <!-- 图形元素 -->
      <div v-show="activeTab === 'figure'" class="element-category">
        <div class="element-item"
             v-if="drawStar.drawStar"
             :class="{ active: selectedElement === 'star' }"
             @click.stop="selectElement('star', 'star', 0)">
          <span class="element-icon">星</span>
          <span class="element-name">{{ t('elementList.elements.star') }}</span>
          <span class="element-type">{{ drawStar.drawStar ? t('elementList.status.enabled') : t('elementList.status.disabled') }}</span>
          <div class="element-actions show-always" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('star', 0)" :title="t('elementList.buttons.delete')">×</button>
          </div>
        </div>
        <div class="element-item"
             v-for="(_, index) in innerCircleList"
             :key="`circle-${index}`"
             :class="{ active: selectedElement === `circle-${index}` }"
             @click.stop="selectElement(`circle-${index}`, 'circle', index)">
          <span class="element-icon">圆</span>
          <span class="element-name">{{ t('elementList.defaults.innerCircleIndex', { index: index + 1 }) }}</span>
          <div class="element-actions show-always" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('circle', index)" title="删除">×</button>
          </div>
        </div>
        <div class="element-item"
             v-for="imageInfo in visibleImages"
             :key="`image-figure-${imageInfo.index}`"
             :class="{ active: selectedElement === `image-${imageInfo.index}` }"
             @click.stop="selectElement(`image-${imageInfo.index}`, 'image', imageInfo.index)">
          <span class="element-icon">图</span>
          <span class="element-name">{{ t('elementList.defaults.imageIndex', { index: imageInfo.index + 1 }) }}</span>
          <div class="element-actions show-always" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('image', imageInfo.index)" title="删除">×</button>
          </div>
        </div>
        <div class="element-item"
             v-for="(line, index) in lineList"
             :key="`figure-line-${line.id || index}`"
             :class="{ active: selectedElement === `line-${index}` }"
             @click.stop="selectElement(`line-${index}`, 'line', index)">
          <span class="element-icon">{{ line.type === 'vertical' ? '纵' : '横' }}</span>
          <span class="element-name">{{ line.type === 'vertical' ? t('elementList.defaults.verticalLineIndex', { index: index + 1 }) : t('elementList.defaults.horizontalLineIndex', { index: index + 1 }) }}</span>
          <div class="element-actions show-always" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('line', index)" title="删除">×</button>
          </div>
        </div>
        <div class="element-item"
             v-for="(svg, index) in svgList"
             :key="`figure-svg-${svg.id || index}`"
             :class="{ active: selectedElement === `svg-${index}` }"
             @click.stop="selectElement(`svg-${index}`, 'svg', index)">
          <span class="element-icon wide">SVG</span>
          <span class="element-name">{{ svg.name || t('elementList.defaults.svgIndex', { index: index + 1 }) }}</span>
          <div class="element-actions show-always" @click.stop>
            <button class="action-btn delete-btn" @click="deleteElement('svg', index)" title="删除">×</button>
          </div>
        </div>
        <p v-if="figureElementCount === 0" class="empty-state">暂无图形元素</p>
      </div>

      <!-- 效果元素 -->
      <div v-show="activeTab === 'effect'" class="element-category">
        <div class="element-item"
             v-if="agingEffect.applyAging"
             :class="{ active: selectedElement === 'aging' }"
             @click.stop="selectElement('aging', 'aging', 0)">
          <span class="element-icon">旧</span>
          <span class="element-name">{{ t('elementList.elements.agingEffect') }}</span>
          <span class="element-type">{{ agingEffect.applyAging ? t('elementList.status.enabled') : t('elementList.status.disabled') }}</span>
        </div>
        <div class="element-item"
             v-if="roughEdge.drawRoughEdge"
             :class="{ active: selectedElement === 'roughEdge' }"
             @click.stop="selectElement('roughEdge', 'roughEdge', 0)">
          <span class="element-icon">边</span>
          <span class="element-name">{{ t('elementList.elements.roughEdge') }}</span>
          <span class="element-type">{{ roughEdge.drawRoughEdge ? t('elementList.status.enabled') : t('elementList.status.disabled') }}</span>
        </div>
        <div class="element-item"
             v-if="securityPattern.openSecurityPattern"
             :class="{ active: selectedElement === 'security' }"
             @click.stop="selectElement('security', 'security', 0)">
          <span class="element-icon">防</span>
          <span class="element-name">{{ t('elementList.elements.securityPattern') }}</span>
          <span class="element-type">{{ securityPattern.openSecurityPattern ? t('elementList.status.enabled') : t('elementList.status.disabled') }}</span>
        </div>
        <p v-if="effectElementCount === 0" class="empty-state">暂无效果元素</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { IDrawStampConfig } from '../../DrawStampTypes'
import { useStampStore } from '../../stores/stampStore'

const { t } = useI18n()

interface Props {
  drawStampUtils?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'selectElement', elementId: string, elementType: string, index: number): void
  (e: 'updateConfig'): void
  (e: 'refresh'): void
}>()

const activeTab = ref<'all' | 'text' | 'figure' | 'effect'>('all')
const selectedElement = ref<string>('')

const tabs = computed(() => [
  { key: 'all' as const, label: t('elementList.tabs.all') },
  { key: 'text' as const, label: t('elementList.tabs.text') },
  { key: 'figure' as const, label: t('elementList.tabs.figure') },
  { key: 'effect' as const, label: t('elementList.tabs.effect') }
])

const stampStore = useStampStore()

const config = computed(() => {
  if (stampStore.state.config) {
    return stampStore.state.config
  }
  return (props.drawStampUtils?.getDrawConfigs?.() || {}) as IDrawStampConfig
})

const companyList = computed(() => config.value.companyList || [])
const stampTypeList = computed(() => config.value.stampTypeList || [])
const stampCodeList = computed(() => {
  const cfg = config.value
  if (cfg.stampCodeList && cfg.stampCodeList.length > 0) return cfg.stampCodeList
  return cfg.stampCode ? [cfg.stampCode] : []
})
const taxNumberList = computed(() => {
  const cfg = config.value
  if (cfg.taxNumberList && cfg.taxNumberList.length > 0) return cfg.taxNumberList
  return cfg.taxNumber?.code ? [cfg.taxNumber] : []
})
const drawStar = computed(() => config.value.drawStar || { drawStar: false })
const innerCircleList = computed(() => config.value.innerCircleList || [])
const lineList = computed(() => config.value.lineList || [])
const visibleImages = computed(() =>
  (config.value.imageList || [])
    .map((image, index) => ({ image, index }))
)
const svgList = computed(() => config.value.svgList || [])
const agingEffect = computed(() => config.value.agingEffect || { applyAging: false })
const roughEdge = computed(() => config.value.roughEdge || { drawRoughEdge: false })
const securityPattern = computed(() => config.value.securityPattern || { openSecurityPattern: false })
const textElementCount = computed(() =>
  companyList.value.length +
  stampTypeList.value.length +
  stampCodeList.value.length +
  taxNumberList.value.length
)
const figureElementCount = computed(() =>
  (drawStar.value.drawStar ? 1 : 0) +
  innerCircleList.value.length +
  visibleImages.value.length +
  lineList.value.length +
  svgList.value.length
)
const effectElementCount = computed(() =>
  (agingEffect.value.applyAging ? 1 : 0) +
  (roughEdge.value.drawRoughEdge ? 1 : 0) +
  (securityPattern.value.openSecurityPattern ? 1 : 0)
)

const selectElement = (elementId: string, elementType: string, index: number) => {
  if (selectedElement.value === elementId) {
    clearSelection()
    emit('selectElement', '', '', -1)
    return
  }

  selectedElement.value = elementId
  emit('selectElement', elementId, elementType, index)
}

const clearSelection = () => {
  selectedElement.value = ''
}

// 删除元素
const deleteElement = (elementType: string, index: number) => {
  if (confirm(t('elementList.confirm.deleteElement'))) {
    stampStore.updateConfig((config) => {
      if (elementType === 'company' && config.companyList) {
        config.companyList.splice(index, 1)
        // 如果删除后列表为空，取消选中
        if (config.companyList.length === 0) {
          selectedElement.value = ''
        }
      } else if (elementType === 'stampType' && config.stampTypeList) {
        config.stampTypeList.splice(index, 1)
        // 如果删除后列表为空，取消选中
        if (config.stampTypeList.length === 0) {
          selectedElement.value = ''
        }
      } else if (elementType === 'code') {
        if (config.stampCodeList) {
          config.stampCodeList.splice(index, 1)
        }
        config.stampCode = (config.stampCodeList && config.stampCodeList[0]) || config.stampCode
        if (selectedElement.value === `code-${index}`) {
          selectedElement.value = ''
        }
      } else if (elementType === 'taxNumber') {
        if (config.taxNumberList) {
          config.taxNumberList.splice(index, 1)
        } else if (index === 0) {
          config.taxNumber.code = ''
        }
        config.taxNumber = (config.taxNumberList && config.taxNumberList[0]) || config.taxNumber
        if (selectedElement.value === `taxNumber-${index}`) {
          selectedElement.value = ''
        }
      } else if (elementType === 'star' && config.drawStar) {
        config.drawStar.drawStar = false
        if (selectedElement.value === 'star') {
          selectedElement.value = ''
        }
      } else if (elementType === 'image' && config.imageList) {
        config.imageList.splice(index, 1)
        if (config.imageList.length === 0) {
          selectedElement.value = ''
        }
      } else if (elementType === 'line' && config.lineList) {
        config.lineList.splice(index, 1)
        if (config.lineList.length === 0) {
          selectedElement.value = ''
        }
      } else if (elementType === 'svg' && config.svgList) {
        config.svgList.splice(index, 1)
        if (config.svgList.length === 0) {
          selectedElement.value = ''
        }
      } else if (elementType === 'circle' && config.innerCircleList) {
        config.innerCircleList.splice(index, 1)
        if (config.innerCircleList.length === 0) {
          selectedElement.value = ''
        }
      }
    })

    emit('updateConfig')
    emit('refresh')
  }
}

// 暴露给父组件调用，方便右侧面板折叠时同步清空左侧选中状态
defineExpose({
  clearSelection
})
</script>

<style scoped>
.element-list-panel {
  width: 304px;
  min-width: 304px;
  background: #ffffff;
  border-right: 1px solid #d9dee7;
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 0;
}

.panel-header {
  min-height: 54px;
  padding: 14px 16px;
  border-bottom: 1px solid #e6eaf0;
  background: #ffffff;
  display: flex;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 15px;
  line-height: 1.3;
  font-weight: 700;
  color: #202733;
}

.panel-tabs {
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid #e6eaf0;
  background: #f7f9fb;
}

.tab-button {
  flex: 1;
  min-width: 0;
  padding: 8px 6px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: #667386;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  white-space: nowrap;
}

.tab-button:hover {
  background: #edf2f7;
}

.tab-button.active {
  color: #202733;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(37, 48, 68, 0.12);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  scrollbar-width: thin;
  scrollbar-color: #b8c2cf transparent;
}

.element-category {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.element-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 8px 9px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
  border: 1px solid #edf0f4;
  background: #ffffff;
}

.element-item:hover {
  background: #f8fbfd;
  border-color: #cfd9e6;
}

.element-item.active {
  background: #f6eef0;
  border-color: #bd2431;
  box-shadow: inset 3px 0 0 #bd2431;
}

.element-icon {
  width: 26px;
  height: 25px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dce3ec;
  background: #f7f9fb;
  color: #5b6878;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  flex-shrink: 0;
}

.element-icon.wide {
  width: 34px;
  font-size: 10px;
  letter-spacing: 0;
}

.element-item.active .element-icon {
  border-color: #bd2431;
  background: #ffffff;
  color: #bd2431;
}

.element-name {
  flex: 1;
  font-size: 14px;
  color: #303b4b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.element-type {
  font-size: 12px;
  color: #667386;
  padding: 2px 8px;
  background: #eef2f6;
  border-radius: 999px;
  white-space: nowrap;
}

.element-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.element-actions.show-always {
  opacity: 1;
}

.element-item:hover .element-actions {
  opacity: 1;
}

.action-btn {
  background: #ffffff;
  border: 1px solid #e1e6ee;
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  line-height: 1;
  color: #7c8796;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.action-btn:hover {
  background: #edf2f7;
}

.delete-btn:hover {
  background: #fff1f0;
  border-color: #f0b8b8;
  color: #bd2431;
}

.empty-state {
  margin: 0;
  padding: 16px 10px;
  border: 1px solid #edf0f4;
  border-radius: 7px;
  background: #fbfcfd;
  color: #8a95a6;
  font-size: 13px;
  text-align: center;
}

@media (max-width: 900px) {
  .element-list-panel {
    width: 100%;
    min-width: 0;
    max-height: 360px;
    border-right: none;
    border-bottom: 1px solid #d9dee7;
  }
}
</style>
