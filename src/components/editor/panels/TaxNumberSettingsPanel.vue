<template>
  <div class="control-group tax-number-group">
    <div class="group-header" @click="toggleExpanded">
      <h3>
        {{ t('stamp.taxNumber.title') }}
        <span class="expand-icon" :class="{ expanded }">▼</span>
      </h3>
    </div>
    <div class="group-content" v-show="expanded">
      <div v-for="(item, index) in taxNumberList" :key="index" class="tax-number-item">
        <div class="tax-number-header">
          <div class="header-left">
            <button
              class="expand-toggle-btn"
              @click.stop="toggleItem(index)"
              :title="isItemExpanded(index) ? t('stamp.common.collapse') : t('stamp.common.expand')"
            >
              <span class="expand-icon" :class="{ expanded: isItemExpanded(index) }">▼</span>
            </button>
            <span>{{ t('stamp.common.line', { index: index + 1 }) }}</span>
          </div>
          <div class="header-actions">
            <button class="action-btn" @click.stop="copyTaxNumber(index)">
              {{ t('stamp.common.copy') }}
            </button>
            <button class="small-button delete-button" @click.stop="removeTaxNumber(index)">
              {{ t('stamp.common.delete') }}
            </button>
          </div>
        </div>

        <transition name="fade">
          <div v-show="isItemExpanded(index)" class="tax-number-body">
            <div class="settings-section">
              <div class="text-input-item">
                <div class="text-input-header">
                  <span class="text-input-label">{{ t('stamp.taxNumber.number') }}:</span>
                </div>
                <input
                  type="text"
                  class="text-input-field"
                  :value="item.code"
                  @input="updateTaxNumber(index, 'code', ($event.target as HTMLInputElement).value)"
                />
              </div>
              <FontPicker
                :model-value="item.fontFamily"
                :fonts="systemFonts"
                :preview-text="item.code || '中间文字 000'"
                :label="t('stamp.taxNumber.font')"
                @update:model-value="value => updateTaxNumber(index, 'fontFamily', value)"
              />
              <label class="inline-label">
                <span class="label-text">{{ t('stamp.taxNumber.fontWeight') }}:</span>
                <select
                  :value="item.fontWeight"
                  @change="updateTaxNumber(index, 'fontWeight', ($event.target as HTMLSelectElement).value)"
                >
                  <option value="normal">{{ t('stamp.common.fontWeight.normal') }}</option>
                  <option value="bold">{{ t('stamp.common.fontWeight.bold') }}</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                  <option value="600">600</option>
                  <option value="700">700</option>
                  <option value="800">800</option>
                  <option value="900">900</option>
                </select>
              </label>
            </div>

            <div class="range-section">
              <div class="range-item">
                <div class="range-header">
                  <span class="range-label-text">{{ t('stamp.taxNumber.compression') }}</span>
                  <span class="range-value-display">[ {{ item.compression.toFixed(2) }} ]</span>
                </div>
                <div class="range-container">
                  <button type="button" class="range-btn" @click.stop="adjustCompression(index, -0.01)">◀</button>
                  <input
                    type="range"
                    :value="item.compression"
                    min="0.0"
                    max="3"
                    step="0.01"
                    @input="updateTaxNumber(index, 'compression', parseNumber($event))"
                  />
                  <button type="button" class="range-btn" @click.stop="adjustCompression(index, 0.01)">▶</button>
                </div>
              </div>
              <div class="range-item">
                <div class="range-header">
                  <span class="range-label-text">{{ t('stamp.taxNumber.letterSpacingShort') }}</span>
                  <span class="range-value-display">[ {{ item.letterSpacing.toFixed(2) }} ]</span>
                </div>
                <div class="range-container">
                  <button type="button" class="range-btn" @click.stop="adjustLetterSpacing(index, -0.01)">◀</button>
                  <input
                    type="range"
                    :value="item.letterSpacing"
                    min="-1"
                    max="20"
                    step="0.01"
                    @input="updateTaxNumber(index, 'letterSpacing', parseNumber($event))"
                  />
                  <button type="button" class="range-btn" @click.stop="adjustLetterSpacing(index, 0.01)">▶</button>
                </div>
              </div>
              <div class="range-item">
                <div class="range-header">
                  <span class="range-label-text">{{ t('stamp.taxNumber.verticalPositionShort') }}</span>
                  <span class="range-value-display">[ {{ item.positionY.toFixed(1) }} ]</span>
                </div>
                <div class="range-container">
                  <button type="button" class="range-btn" @click.stop="adjustPositionY(index, -0.1)">◀</button>
                  <input
                    type="range"
                    :value="item.positionY"
                    min="-10"
                    max="10"
                    step="0.1"
                    @input="updateTaxNumber(index, 'positionY', parseNumber($event))"
                  />
                  <button type="button" class="range-btn" @click.stop="adjustPositionY(index, 0.1)">▶</button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <button class="add-button" @click="addTaxNumber">{{ t('stamp.common.addNew') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IDrawStampConfig, ITaxNumber } from '../../../DrawStampTypes'
import FontPicker from '../controls/FontPicker.vue'

const { t } = useI18n()

const props = defineProps<{
  expanded: boolean
  config: IDrawStampConfig
  systemFonts: string[]
  selectedIndex?: number
}>()

const emit = defineEmits<{
  (e: 'update:expanded', value: boolean): void
  (e: 'update-config', updater: (config: IDrawStampConfig) => void): void
}>()

const toggleExpanded = () => {
  emit('update:expanded', !props.expanded)
}

const selectedIndex = computed(() => props.selectedIndex ?? -1)
const taxNumberList = computed(() => {
  const cfg = props.config
  if (cfg.taxNumberList && cfg.taxNumberList.length > 0) return cfg.taxNumberList
  return cfg.taxNumber ? [cfg.taxNumber] : []
})

const expandedItems = ref<Record<number, boolean>>({})

watch(
  selectedIndex,
  (newIndex) => {
    if (newIndex >= 0) {
      expandedItems.value[newIndex] = true
    }
  },
  { immediate: true }
)

const parseNumber = (event: Event) => Number((event.target as HTMLInputElement).value)

const createDefaultTaxNumber = (config: IDrawStampConfig): ITaxNumber => ({
  code: '',
  compression: 0.7,
  fontHeight: 3.7,
  fontFamily: 'Arial',
  fontWidth: 1.3,
  letterSpacing: 8,
  positionY: 0,
  totalWidth: 26,
  fontWeight: 'normal',
  color: config.primaryColor || '#FF0015'
})

const ensureTaxNumberList = (config: IDrawStampConfig) => {
  if (!config.taxNumberList) {
    config.taxNumberList = []
  }
  if (config.taxNumberList.length === 0) {
    config.taxNumberList.push(
      config.taxNumber
        ? { ...createDefaultTaxNumber(config), ...config.taxNumber }
        : createDefaultTaxNumber(config)
    )
  }
  return config.taxNumberList
}

const syncFirstTaxNumber = (config: IDrawStampConfig) => {
  config.taxNumber = config.taxNumberList?.[0] || createDefaultTaxNumber(config)
}

const updateTaxNumber = <K extends keyof ITaxNumber>(
  index: number,
  key: K,
  value: ITaxNumber[K]
) => {
  emit('update-config', (config) => {
    const list = ensureTaxNumberList(config)
    if (!list[index]) return
    list[index][key] = value
    syncFirstTaxNumber(config)
  })
}

const toggleItem = (index: number) => {
  expandedItems.value[index] = !isItemExpanded(index)
}

const isItemExpanded = (index: number) => {
  if (selectedIndex.value === index) return true
  return expandedItems.value[index] ?? true
}

const copyTaxNumber = (index: number) => {
  emit('update-config', (config) => {
    const list = ensureTaxNumberList(config)
    if (!list[index]) return
    list.splice(index + 1, 0, { ...list[index] })
    syncFirstTaxNumber(config)
  })
}

const removeTaxNumber = (index: number) => {
  emit('update-config', (config) => {
    if (!config.taxNumberList) config.taxNumberList = []
    config.taxNumberList.splice(index, 1)
    syncFirstTaxNumber(config)
  })
}

const addTaxNumber = () => {
  emit('update-config', (config) => {
    const list = ensureTaxNumberList(config)
    const base = list[list.length - 1] || createDefaultTaxNumber(config)
    config.taxNumberList!.push({ ...base, code: '' })
    syncFirstTaxNumber(config)
  })
}

const adjustCompression = (index: number, delta: number) => {
  emit('update-config', (config) => {
    const list = ensureTaxNumberList(config)
    if (!list[index]) return
    list[index].compression = Math.max(0.0, Math.min(3, list[index].compression + delta))
    syncFirstTaxNumber(config)
  })
}

const adjustLetterSpacing = (index: number, delta: number) => {
  emit('update-config', (config) => {
    const list = ensureTaxNumberList(config)
    if (!list[index]) return
    list[index].letterSpacing = Math.max(-1, Math.min(20, list[index].letterSpacing + delta))
    syncFirstTaxNumber(config)
  })
}

const adjustPositionY = (index: number, delta: number) => {
  emit('update-config', (config) => {
    const list = ensureTaxNumberList(config)
    if (!list[index]) return
    list[index].positionY = Math.max(-10, Math.min(10, list[index].positionY + delta))
    syncFirstTaxNumber(config)
  })
}
</script>

<style scoped>
.group-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tax-number-item {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.tax-number-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(to bottom, #fafafa, #f5f5f5);
  border-bottom: 1px solid #e8e8e8;
  transition: background 0.2s;
  gap: 12px;
}

.tax-number-header:hover {
  background: linear-gradient(to bottom, #f5f5f5, #f0f0f0);
}

.header-left,
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left {
  min-width: 0;
  font-weight: 600;
}

.header-actions {
  flex-shrink: 0;
}

.tax-number-body {
  padding: 14px 16px 16px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.range-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #374151;
  gap: 4px;
  margin-bottom: 0;
}

.inline-label {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.inline-label .label-text {
  min-width: 100px;
  flex-shrink: 0;
  font-size: 13px;
  color: #374151;
}

.inline-label select {
  flex: 1;
  width: 0;
  min-width: 0;
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.inline-label select:focus,
.text-input-field:focus {
  border-color: #3b82f6;
  outline: none;
}

.text-input-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.text-input-header {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.text-input-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.text-input-field {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.range-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.range-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.range-label-text {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.range-value-display {
  font-size: 12px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.range-container {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.range-btn {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  background-color: #f9fafb;
  color: #6b7280;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  line-height: 1;
}

.range-btn:hover,
.expand-toggle-btn:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.range-container input[type="range"] {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 3px;
  outline: none;
}

.range-container input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s ease;
}

.range-container input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease;
}

.expand-toggle-btn {
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;
  min-width: 24px;
  height: 24px;
}

.action-btn {
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;
  font-size: 12px;
  white-space: nowrap;
}

.action-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
  background: #e6f7ff;
}

.expand-icon {
  font-size: 10px;
  transition: transform 0.2s;
  display: inline-block;
  line-height: 1;
}

.expand-icon:not(.expanded) {
  transform: rotate(-90deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
