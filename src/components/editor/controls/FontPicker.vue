<template>
  <div class="font-picker">
    <div class="font-picker-header">
      <span>{{ label }}</span>
      <span class="font-current">{{ getFontDisplayName(modelValue) }}</span>
    </div>

    <div class="font-quick-list">
      <button
        v-for="font in quickFonts"
        :key="font"
        type="button"
        class="font-chip"
        :class="{ active: modelValue === font }"
        :style="{ fontFamily: getFontCssFamily(font) }"
        @click="updateFont(font)"
      >
        {{ getFontDisplayName(font).replace(/\s*\(.+\)\s*$/, '') }}
      </button>
    </div>

    <div class="font-row">
      <select
        class="font-select"
        :value="modelValue"
        @change="updateFont(($event.target as HTMLSelectElement).value)"
      >
        <option
          v-for="font in allFonts"
          :key="font"
          :value="font"
          :style="{ fontFamily: getFontCssFamily(font) }"
        >
          {{ getFontDisplayName(font) }}
        </option>
      </select>
      <input
        class="font-input"
        type="text"
        :value="modelValue"
        placeholder="手动输入字体名"
        @input="inputFont(($event.target as HTMLInputElement).value)"
        @change="updateFont(($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="font-preview" :style="{ fontFamily: getFontCssFamily(modelValue) }">
      <span>预览</span>
      <strong>{{ previewText }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  getFontDisplayName,
  getCanonicalFontName,
  getFontCssFamily,
  getRecommendedStampFonts
} from '../../../utils/fontUtils'

const props = withDefaults(defineProps<{
  modelValue: string
  fonts: string[]
  label?: string
  previewText?: string
}>(), {
  label: '字体',
  previewText: '印章文字 012345'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const compactFontOptions = [
  'FZXiaoBiaoSong-B05S',
  'STLiti',
  'LiSu',
  'SimLi',
  'SimSun',
  'Songti SC',
  'STSong',
  'KaiTi',
  'Kaiti SC',
  'STKaiti',
  'FangSong',
  'SimHei',
  'Microsoft YaHei',
  'Arial'
]

const RECENT_FONT_KEY = 'drawstamp_recent_fonts'
const recentFonts = ref<string[]>(loadRecentFonts())

function loadRecentFonts() {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_FONT_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, 4) : []
  } catch {
    return []
  }
}

function saveRecentFont(font: string) {
  if (!font) return
  const next = [font, ...recentFonts.value.filter(item => item !== font)].slice(0, 4)
  recentFonts.value = next
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(RECENT_FONT_KEY, JSON.stringify(next))
  }
}

const allFonts = computed(() => {
  const merged = [...recentFonts.value, ...compactFontOptions, ...getRecommendedStampFonts(), props.modelValue]
  return Array.from(new Set(merged.filter(Boolean)))
})

const quickFonts = computed(() => {
  const available = new Set(allFonts.value)
  const recommended = getRecommendedStampFonts().filter(font => available.has(font))
  return Array.from(new Set([...recentFonts.value, ...recommended])).slice(0, 8)
})

const updateFont = (font: string) => {
  const canonicalFont = getCanonicalFontName(font)
  saveRecentFont(canonicalFont)
  emit('update:modelValue', canonicalFont)
}

const inputFont = (font: string) => {
  emit('update:modelValue', getCanonicalFontName(font))
}
</script>

<style scoped>
.font-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-bottom: 8px;
  padding: 10px;
  border: 1px solid var(--studio-line);
  border-radius: 8px;
  background: #fbfcfd;
  box-sizing: border-box;
}

.font-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #303b4b;
  font-size: 13px;
  font-weight: 600;
}

.font-current {
  min-width: 0;
  color: #7a8495;
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-quick-list {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.font-quick-list::-webkit-scrollbar {
  display: none;
}

.font-chip {
  flex: 0 0 auto;
  min-height: 28px;
  padding: 4px 9px;
  border: 1px solid #d8e0ea;
  border-radius: 999px;
  background: #ffffff;
  color: #303b4b;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.font-chip:hover,
.font-chip.active {
  border-color: var(--studio-ui-red);
  background: var(--studio-ui-red-soft);
  color: var(--studio-ui-red);
}

.font-row {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 8px;
}

.font-select,
.font-input {
  min-width: 0;
  width: 100%;
  height: 34px;
  padding: 6px 9px;
  border: 1px solid var(--studio-line);
  border-radius: 7px;
  background: #ffffff;
  color: var(--studio-ink);
  font-size: 13px;
  box-sizing: border-box;
}

.font-select:focus,
.font-input:focus {
  border-color: var(--studio-focus-border);
  box-shadow: var(--studio-focus);
  outline: none;
}

.font-preview {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  min-height: 34px;
  padding: 7px 9px;
  border: 1px dashed #cfd7e4;
  border-radius: 7px;
  background: #ffffff;
  color: var(--studio-ink);
}

.font-preview span {
  color: #8a95a6;
  font-family: Inter, system-ui, sans-serif;
  font-size: 12px;
}

.font-preview strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 600;
}

@media (max-width: 520px) {
  .font-row {
    grid-template-columns: 1fr;
  }
}
</style>
