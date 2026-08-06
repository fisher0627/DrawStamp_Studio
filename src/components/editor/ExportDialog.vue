<template>
  <!-- 导出格式弹窗 -->
  <div class="legal-dialog-overlay" @click.self="dock.closeFormatDialog">
    <div class="legal-dialog export-dialog">
      <div class="export-dialog-header">
        <div>
          <h3>{{ t('stamp.exportFormat.title') }}</h3>
        </div>
        <button type="button" class="export-close-button" @click="dock.closeFormatDialog" :aria-label="t('homepage.canvas.close')">×</button>
      </div>
      <div class="legal-content export-dialog-content">
        <section class="export-preview-panel">
          <div class="export-preview-card" :class="{ checker: dock.selectedFormat === 'png' && !dock.useWhitePngBackground }">
            <img v-if="dock.exportPreviewUrl" :src="dock.exportPreviewUrl" :alt="t('studio.editor.previewAlt')" />
            <div v-else class="export-preview-empty" aria-busy="true" :aria-label="t('homepage.canvas.previewGenerating')">
              <span class="skeleton-stamp"></span>
            </div>
          </div>
          <div class="export-preview-meta">
            <strong>{{ dock.exportSummary }}</strong>
            <span>{{ dock.exportBackgroundLabel }}</span>
          </div>
        </section>

        <section class="export-settings-panel">
          <div class="export-section">
            <div class="export-section-title">
              <label>{{ t('studio.editor.fileFormat') }}</label>
              <span>{{ dock.selectedFormatInfo?.tip }}</span>
            </div>
            <div class="format-options">
              <button
                v-for="format in dock.exportFormats"
                :key="format.value"
                type="button"
                class="format-button"
                :class="{ active: dock.selectedFormat === format.value }"
                @click="dock.selectedFormat = format.value"
              >
                <span class="format-icon">{{ format.icon }}</span>
                <span>
                  <span class="format-name">{{ format.name }}</span>
                  <span class="format-desc">{{ format.desc }}</span>
                </span>
                <em v-if="format.value === 'png'">{{ t('studio.editor.recommended') }}</em>
              </button>
            </div>
          </div>

          <div v-if="dock.selectedFormat === 'jpeg'" class="quality-setting">
            <label>{{ t('stamp.exportFormat.quality') }} <strong>{{ dock.jpegQuality }}%</strong></label>
            <input
              type="range"
              v-model.number="dock.jpegQuality"
              min="10"
              max="100"
              step="5"
              class="quality-slider"
            />
          </div>

          <div class="export-section">
            <div class="export-section-title">
              <label>{{ t('studio.editor.exportScale') }}</label>
              <span>{{ dock.exportSizeLabel }}</span>
            </div>
            <div class="scale-options">
              <button
                v-for="option in dock.scaleOptions"
                :key="option.value"
                type="button"
                class="scale-button"
                :class="{ active: dock.selectedScale === option.value }"
                @click="dock.applyExportScale(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <label v-if="dock.selectedFormat === 'png'" class="export-checkbox">
            <input type="checkbox" v-model="dock.useWhitePngBackground" />
            <span>{{ t('studio.editor.pngWhiteBackground') }}</span>
          </label>

          <div class="export-section">
            <div class="export-section-title">
              <label>{{ t('studio.editor.filename') }}</label>
              <span>{{ t('studio.editor.autoExtension') }}</span>
            </div>
            <input
              v-model="dock.exportFilename"
              type="text"
              class="export-name-input"
              :placeholder="t('studio.editor.filenamePlaceholder')"
            />
          </div>

          <details class="export-advanced">
            <summary>{{ t('studio.editor.moreSizeSettings') }}</summary>
            <div class="size-setting">
              <div class="size-setting-header">
                <label>{{ t('stamp.exportFormat.sizeTitle') }}</label>
                <button class="size-reset" type="button" @click="dock.resetExportSize">
                  {{ t('stamp.exportFormat.resetSize') }}
                </button>
              </div>
              <div class="ratio-setting">
                <label>{{ t('stamp.exportFormat.ratioTitle') }}</label>
                <div class="ratio-options">
                  <button
                    v-for="option in dock.ratioOptions"
                    :key="option.value"
                    type="button"
                    class="ratio-button"
                    :class="{ active: dock.selectedRatio === option.value }"
                    @click="dock.applyRatio(option.value)"
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
                    v-model.number="dock.exportWidth"
                    :min="dock.MIN_EXPORT_SIZE"
                    :max="dock.MAX_EXPORT_SIZE"
                    @input="dock.handleWidthInput"
                    @change="dock.handleWidthInput"
                  />
                </div>
                <div class="size-field">
                  <span>{{ t('stamp.exportFormat.height') }} (px)</span>
                  <input
                    type="number"
                    v-model.number="dock.exportHeight"
                    :min="dock.MIN_EXPORT_SIZE"
                    :max="dock.MAX_EXPORT_SIZE"
                    @input="dock.handleHeightInput"
                    @change="dock.handleHeightInput"
                  />
                </div>
              </div>
              <p class="size-hint">
                {{ t('stamp.exportFormat.sizeHint', { width: Math.round(dock.defaultExportWidth) || 0, height: Math.round(dock.defaultExportHeight) || 0 }) }}
              </p>
              <p class="size-hint">
                {{ t('stamp.exportFormat.sizeLimit', { min: dock.MIN_EXPORT_SIZE, max: dock.MAX_EXPORT_SIZE }) }}
              </p>
            </div>
          </details>
        </section>
      </div>
      <div class="dialog-buttons">
        <button @click="dock.closeFormatDialog" class="cancel-button">{{ t('stamp.exportFormat.cancel') }}</button>
        <button @click="dock.confirmExport" class="confirm-button">
          {{ t('studio.editor.downloadFormat', { format: dock.selectedFormat.toUpperCase() }) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ExportDockModel } from '../../composables/useExportDock'

defineProps<{
  dock: ExportDockModel
}>()

const { t } = useI18n()
</script>

<style scoped>
.export-dialog {
  max-width: 860px;
  width: 94%;
  padding: 24px 26px 22px;
}

.export-dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.export-dialog-header h3 {
  margin: 0;
}

.export-eyebrow {
  font-size: 13px;
}

.export-close-button {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  background: var(--studio-panel-muted);
  color: var(--studio-muted);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.export-close-button:hover {
  background: rgba(163, 58, 50, 0.12);
  color: var(--studio-ui-red);
}

.export-dialog-content {
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
}

.export-preview-panel,
.export-settings-panel {
  flex: 1;
  min-width: 0;
}

.export-preview-panel {
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.export-preview-card {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border: 1px solid var(--studio-line);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(250, 251, 247, 0.96)),
    var(--studio-paper);
  overflow: hidden;
}

.export-preview-card.checker {
  background-color: #fff;
  background-image:
    linear-gradient(45deg, #eceff1 25%, transparent 25%, transparent 75%, #eceff1 75%),
    linear-gradient(45deg, #eceff1 25%, transparent 25%, transparent 75%, #eceff1 75%);
  background-size: 16px 16px;
  background-position: 0 0, 8px 8px;
}

.export-preview-card img {
  max-width: 88%;
  max-height: 88%;
  object-fit: contain;
  display: block;
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
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.export-section-title label {
  color: var(--studio-ink);
  font-size: 13px;
  font-weight: 600;
}

.export-section-title span {
  color: var(--studio-muted);
  font-size: 12px;
}

.export-dialog .format-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.export-dialog .format-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: var(--studio-panel);
  color: var(--studio-ink);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
}

.export-dialog .format-button:hover,
.export-dialog .format-button.active {
  border-color: var(--studio-ui-red);
  background: #fff6f4;
  box-shadow: 0 0 0 3px rgba(163, 58, 50, 0.08);
}

.export-dialog .format-icon {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--studio-tool-blue-soft);
  color: var(--studio-tool-blue);
  font-size: 13px;
  font-weight: 700;
}

.export-dialog .format-name,
.export-dialog .format-desc {
  display: block;
}

.export-dialog .format-name {
  font-size: 13px;
  font-weight: 600;
}

.export-dialog .format-desc {
  color: var(--studio-muted);
  font-size: 11px;
}

.export-dialog .format-button em {
  margin-left: auto;
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(163, 58, 50, 0.1);
  color: var(--studio-ui-red);
  font-size: 10px;
  font-style: normal;
}

.export-dialog .quality-setting {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.export-dialog .quality-setting label {
  color: var(--studio-ink);
  font-size: 13px;
  font-weight: 600;
}

.export-dialog .quality-setting label strong {
  color: var(--studio-ui-red);
}

.export-dialog .quality-slider {
  width: 100%;
  accent-color: var(--studio-ui-red);
}

.export-dialog .quality-slider::-webkit-slider-thumb,
.export-dialog .quality-slider::-moz-range-thumb {
  background: var(--studio-ui-red);
}

.export-dialog .quality-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 999px;
  background: var(--studio-line);
  outline: none;
}

.export-dialog .scale-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.export-dialog .scale-button {
  min-height: 34px;
  border: 1px solid var(--studio-line);
  border-radius: 7px;
  background: var(--studio-panel);
  color: var(--studio-ink);
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.export-dialog .scale-button:hover,
.export-dialog .scale-button.active {
  border-color: var(--studio-ui-red);
  background: #fff5f3;
  color: var(--studio-ui-red);
}

.export-dialog .export-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--studio-ink);
  font-size: 13px;
}

.export-dialog .export-name-input {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 11px;
  border: 1px solid var(--studio-line);
  border-radius: 8px;
  color: var(--studio-ink);
  font-size: 13px;
  background: var(--studio-panel);
  transition: border-color 0.18s, box-shadow 0.18s;
}

.export-dialog .export-name-input:focus {
  border-color: var(--studio-ui-red);
  box-shadow: 0 0 0 3px rgba(163, 58, 50, 0.1);
  outline: none;
}

.export-advanced {
  border: 1px solid var(--studio-line);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  overflow: hidden;
}

.export-advanced summary {
  padding: 10px 12px;
  color: var(--studio-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

.export-advanced .size-setting {
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.export-dialog .size-setting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.export-dialog .size-field input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid var(--studio-line);
  border-radius: 7px;
  color: var(--studio-ink);
  font-size: 13px;
  background: var(--studio-panel);
}

.export-dialog .size-field input:focus {
  border-color: var(--studio-ui-red);
  box-shadow: 0 0 0 3px rgba(163, 58, 50, 0.1);
  outline: none;
}

.export-dialog .size-reset {
  border: 0;
  background: transparent;
  color: var(--studio-tool-blue);
  font-size: 12px;
  cursor: pointer;
}

.export-dialog .size-reset:hover {
  text-decoration: underline;
}

.export-dialog .ratio-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.export-dialog .ratio-button {
  padding: 5px 10px;
  border: 1px solid var(--studio-line);
  border-radius: 6px;
  background: var(--studio-panel);
  color: var(--studio-ink);
  font-size: 12px;
  cursor: pointer;
}

.export-dialog .ratio-button:hover {
  border-color: var(--studio-tool-blue);
}

.export-dialog .ratio-button.active {
  border-color: var(--studio-ui-red);
  background: #fff5f3;
  color: var(--studio-ui-red);
}

.export-dialog .dialog-buttons {
  margin-top: 4px;
}

.export-dialog .cancel-button,
.export-dialog .confirm-button {
  padding: 9px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.export-dialog .cancel-button {
  border: 1px solid var(--studio-line);
  background: var(--studio-panel);
  color: var(--studio-ink);
}

.export-dialog .cancel-button:hover {
  border-color: var(--studio-muted);
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
</style>
