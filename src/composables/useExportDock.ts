import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { DrawStampUtils } from '../DrawStampUtils'
import { trackEvent } from '../utils/analytics'
import { downloadStampImage } from '../utils/exportImage'
import type { IDrawStampConfig } from '../DrawStampTypes'

export const MIN_EXPORT_SIZE = 100
export const MAX_EXPORT_SIZE = 4096

export type ExportFormat = 'png' | 'jpeg' | 'svg'
export type ExportRatio = 'original' | 'square' | '4:3' | '16:9' | 'custom'
export type ExportScale = 1 | 2 | 3 | 4

/**
 * 导出相关的共享状态与逻辑（底部快速导出 dock + 导出格式弹窗共用）
 */
export function useExportDock(getUtils: () => DrawStampUtils | null) {
  const { t, locale } = useI18n()
  const tr = (zh: string, en: string) => locale.value === 'zh' ? zh : en

  const showFormatDialog = ref(false)
  const selectedFormat = ref<ExportFormat>('png')
  const jpegQuality = ref(92)
  const defaultExportWidth = ref(0)
  const defaultExportHeight = ref(0)
  const exportWidth = ref(0)
  const exportHeight = ref(0)
  const selectedScale = ref<ExportScale>(1)
  const useWhitePngBackground = ref(false)
  const exportFilename = ref('')
  const exportPreviewUrl = ref('')
  const selectedRatio = ref<ExportRatio>('original')

  const physicalMode = ref(false)
  const physicalWidth = ref(40)
  const physicalHeight = ref(40)
  const dpi = ref(300)
  const exportError = ref('')
  const exporting = ref(false)
  const physicalError = computed(() => {
    if (!physicalMode.value) return ''
    const config = getUtils()?.getDrawConfigs()
    if (!config) return ''
    const width = physicalWidth.value * (config.width + 2) / config.width * dpi.value / 25.4
    const height = physicalHeight.value * (config.height + 2) / config.height * dpi.value / 25.4
    if (![physicalWidth.value, physicalHeight.value, dpi.value].every(Number.isFinite) || physicalWidth.value <= 0 || physicalHeight.value <= 0 || !Number.isInteger(dpi.value) || dpi.value < 72 || dpi.value > 1200) return tr('请输入有效尺寸及 72–1200 DPI。', 'Enter a valid size and 72–1200 DPI.')
    if (width < 1 || height < 1 || width > MAX_EXPORT_SIZE || height > MAX_EXPORT_SIZE) return tr('此尺寸超出 1–4096 像素，请降低尺寸或 DPI。', 'Output exceeds 1–4096 pixels. Reduce size or DPI.')
    return ''
  })
  const physicalSummary = computed(() => tr(`章体 ${physicalWidth.value} × ${physicalHeight.value} mm · ${dpi.value} DPI（另含边缘留白）`, `Stamp ${physicalWidth.value} × ${physicalHeight.value} mm · ${dpi.value} DPI (plus edge padding)`))
  const applyPhysicalSize = (axis: 'width' | 'height' = 'width') => {
    const config = getUtils()?.getDrawConfigs()
    if (!config) return
    if (axis === 'width') physicalHeight.value = Number((physicalWidth.value * config.height / config.width).toFixed(3))
    else physicalWidth.value = Number((physicalHeight.value * config.width / config.height).toFixed(3))
    if (physicalError.value) return
    exportWidth.value = Math.round(physicalWidth.value * (config.width + 2) / config.width * dpi.value / 25.4)
    exportHeight.value = Math.round(physicalHeight.value * (config.height + 2) / config.height * dpi.value / 25.4)
    void refreshExportPreview()
  }
  const setPhysicalMode = () => {
    if (physicalMode.value) {
      const config = getUtils()?.getDrawConfigs()
      if (config) { physicalWidth.value = config.width; physicalHeight.value = config.height }
      applyPhysicalSize()
    } else { resetExportSize() }
  }

  let exportPreviewRequestId = 0

  const exportFormats = computed(() => [
    { value: 'png' as const, name: 'PNG', icon: 'P', desc: t('studio.editor.formats.pngDesc'), tip: t('studio.editor.formats.pngTip') },
    { value: 'svg' as const, name: 'SVG', icon: 'S', desc: t('studio.editor.formats.svgDesc'), tip: t('studio.editor.formats.svgTip') },
    { value: 'jpeg' as const, name: 'JPEG', icon: 'J', desc: t('studio.editor.formats.jpegDesc'), tip: t('studio.editor.formats.jpegTip') }
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
    return `${selectedFormat.value.toUpperCase()} · ${physicalMode.value ? `${dpi.value} DPI` : `${selectedScale.value}x`} · ${exportSizeLabel.value}`
  })

  const exportBackgroundLabel = computed(() => {
    if (selectedFormat.value === 'png') {
      return useWhitePngBackground.value ? t('studio.editor.whiteBackground') : t('studio.editor.transparentBackground')
    }
    if (selectedFormat.value === 'svg') {
      return t('studio.editor.vectorExport')
    }
    return t('studio.editor.jpegQuality', { quality: jpegQuality.value })
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

  const getPrimaryCompanyName = (config: IDrawStampConfig) => {
    return (
      config.companyList?.find(item => item.companyName?.trim())?.companyName ||
      config.company?.companyName ||
      t('studio.editor.defaultFilename')
    ).trim()
  }

  const buildExportFilename = (config: IDrawStampConfig) => {
    const companyName = getPrimaryCompanyName(config)
    const stampType = config.stampTypeList?.find(item => item.stampType?.trim())?.stampType || config.stampType?.stampType || t('studio.editor.stampFallback')
    const today = new Date()
    const dateText = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
    return `${companyName}_${stampType}_${dateText}`
  }

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

  const refreshExportPreview = async () => {
    const utils = getUtils()
    if (!utils) return
    const requestId = ++exportPreviewRequestId
    await new Promise(resolve => setTimeout(resolve, 100))
    if (requestId !== exportPreviewRequestId) return
    const width = physicalMode.value ? exportWidth.value : clampExportSize(exportWidth.value, Math.round(defaultExportWidth.value) || MIN_EXPORT_SIZE)
    const height = physicalMode.value ? exportHeight.value : clampExportSize(exportHeight.value, Math.round(defaultExportHeight.value) || MIN_EXPORT_SIZE)
    try {
      let previewUrl = await utils.getStampImageBase64(
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

  const refreshExportDefaults = () => {
    const utils = getUtils()
    if (!utils) return
    const baseSize = utils.getExportBaseSize()
    defaultExportWidth.value = Math.round(baseSize.width)
    defaultExportHeight.value = Math.round(baseSize.height)
    exportWidth.value = clampExportSize(Math.round(defaultExportWidth.value * selectedScale.value), defaultExportWidth.value)
    exportHeight.value = clampExportSize(Math.round(defaultExportHeight.value * selectedScale.value), defaultExportHeight.value)
    if (!exportFilename.value) {
      exportFilename.value = buildExportFilename(utils.getDrawConfigs())
    }
    refreshExportPreview()
  }

  const prepareExportDock = () => {
    refreshExportDefaults()
  }

  const quickExportFromDock = async () => {
    if (exporting.value) return
    physicalMode.value = false
    selectedFormat.value = 'png'
    refreshExportDefaults()
    trackEvent('export_start', { source: 'quick' })
    await confirmExport(false)
  }

  const applyRatio = (ratio: ExportRatio) => {
    physicalMode.value = false
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

  const applyExportScale = (scale: ExportScale) => {
    physicalMode.value = false
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

  const openExportDialog = () => {
    const utils = getUtils()
    if (!utils) return
    const baseSize = utils.getExportBaseSize()
    defaultExportWidth.value = Math.round(baseSize.width)
    defaultExportHeight.value = Math.round(baseSize.height)
    physicalMode.value = false
    exportError.value = ''
    resetExportSize()
    selectedFormat.value = 'png'
    jpegQuality.value = 92
    useWhitePngBackground.value = false
    exportFilename.value = buildExportFilename(utils.getDrawConfigs())
    refreshExportPreview()

    showFormatDialog.value = true
    trackEvent('export_start')
  }

  const closeFormatDialog = () => {
    showFormatDialog.value = false
  }

  const confirmExport = async (closeAfter = true) => {
    const utils = getUtils()
    if (!utils || exporting.value || physicalError.value) return
    exporting.value = true; exportError.value = ''
    // Snapshot options before awaiting image decoding.
    const format = selectedFormat.value
    const resolution = physicalMode.value ? dpi.value : undefined
    const width = physicalMode.value ? exportWidth.value : clampExportSize(exportWidth.value, defaultExportWidth.value)
    const height = physicalMode.value ? exportHeight.value : clampExportSize(exportHeight.value, defaultExportHeight.value)
    const white = format === 'png' && useWhitePngBackground.value
    const filename = exportFilename.value || buildExportFilename(utils.getDrawConfigs())
    try {
      let data = await utils.getStampImageBase64(format === 'jpeg' ? 'jpeg' : 'png', jpegQuality.value / 100, Math.round(width), Math.round(height))
      if (white) data = await addWhiteBackgroundToDataUrl(data)
      await downloadStampImage(data, format, filename, resolution)
      trackEvent('export_success', { format, mode: resolution ? 'physical' : 'pixels', source: closeAfter ? 'dialog' : 'quick' })
      if (closeAfter) closeFormatDialog()
    } catch {
      exportError.value = tr('导出失败，请检查图片和字体后重试。', 'Export failed. Check images and fonts, then retry.')
      showFormatDialog.value = true
    } finally { exporting.value = false }
  }

  watch([selectedFormat, jpegQuality, useWhitePngBackground], () => {
    if (showFormatDialog.value) {
      refreshExportPreview()
    }
  })

  onUnmounted(() => { exportPreviewRequestId++ })

  return reactive({
    physicalMode, physicalWidth, physicalHeight, dpi, physicalError, physicalSummary, applyPhysicalSize, setPhysicalMode, exportError, exporting,
    showFormatDialog,
    selectedFormat,
    jpegQuality,
    MIN_EXPORT_SIZE,
    MAX_EXPORT_SIZE,
    defaultExportWidth,
    defaultExportHeight,
    exportWidth,
    exportHeight,
    selectedScale,
    useWhitePngBackground,
    exportFilename,
    exportPreviewUrl,
    selectedRatio,
    exportFormats,
    selectedFormatInfo,
    exportSizeLabel,
    exportSummary,
    exportBackgroundLabel,
    ratioOptions,
    scaleOptions,
    buildExportFilename,
    getPrimaryCompanyName,
    applyRatio,
    resetExportSize,
    applyExportScale,
    refreshExportDefaults,
    prepareExportDock,
    quickExportFromDock,
    handleWidthInput,
    handleHeightInput,
    refreshExportPreview,
    openExportDialog,
    closeFormatDialog,
    confirmExport
  })
}

export type ExportDockModel = ReturnType<typeof useExportDock>
