import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { InitDrawStampConfigsUtils } from '../utils/InitDrawStampConfigsUtils'
import { DEFAULT_STAMP_RED } from '../Constants'
import type { IDrawStampConfig } from '../DrawStampTypes'

export type TemplatePresetKey = 'contract' | 'official' | 'finance' | 'invoice' | 'receipt' | 'business' | 'quotation' | 'clean'
export type TemplateCategoryKey = 'all' | 'general' | 'finance' | 'business'

/**
 * 常用印章模板预设：分类、预设列表与预设配置生成
 */
export function useTemplatePresets(getCompanyName: (config: IDrawStampConfig) => string) {
  const { t } = useI18n()

  const templatePresetCategories = computed(() => [
    { key: 'all' as const, label: t('studio.editor.templateCategories.all') },
    { key: 'general' as const, label: t('studio.editor.templateCategories.general') },
    { key: 'finance' as const, label: t('studio.editor.templateCategories.finance') },
    { key: 'business' as const, label: t('studio.editor.templateCategories.business') }
  ])

  function templateCopy(key: TemplatePresetKey) {
    return {
      name: t(`studio.editor.templates.${key}.name`),
      desc: t(`studio.editor.templates.${key}.desc`),
      badge: t(`studio.editor.templates.${key}.badge`)
    }
  }

  const templatePresets = computed(() => [
    { key: 'contract' as const, category: 'general' as const, mark: '合', shape: 'circle', ...templateCopy('contract') },
    { key: 'official' as const, category: 'general' as const, mark: '公', shape: 'circle', ...templateCopy('official') },
    { key: 'finance' as const, category: 'finance' as const, mark: '财', shape: 'ellipse', ...templateCopy('finance') },
    { key: 'invoice' as const, category: 'finance' as const, mark: '票', shape: 'ellipse', ...templateCopy('invoice') },
    { key: 'receipt' as const, category: 'finance' as const, mark: '收', shape: 'ellipse', ...templateCopy('receipt') },
    { key: 'business' as const, category: 'business' as const, mark: '业', shape: 'circle', ...templateCopy('business') },
    { key: 'quotation' as const, category: 'business' as const, mark: '价', shape: 'ellipse', ...templateCopy('quotation') },
    { key: 'clean' as const, category: 'general' as const, mark: '新', shape: 'circle', ...templateCopy('clean') }
  ])

  const activeTemplatePreset = ref<TemplatePresetKey>('contract')
  const activeTemplateCategory = ref<TemplateCategoryKey>('all')
  const isTemplatePickerOpen = ref(false)
  const activeTemplatePresetInfo = computed(() => {
    return templatePresets.value.find((preset) => preset.key === activeTemplatePreset.value) || templatePresets.value[0]
  })
  const filteredTemplatePresets = computed(() => {
    if (activeTemplateCategory.value === 'all') return templatePresets.value
    return templatePresets.value.filter(preset => preset.category === activeTemplateCategory.value)
  })

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

    const companyName = getCompanyName(base).includes('印章') ? '示例科技有限公司' : getCompanyName(base)
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

  return reactive({
    templatePresetCategories,
    templatePresets,
    activeTemplatePreset,
    activeTemplateCategory,
    isTemplatePickerOpen,
    activeTemplatePresetInfo,
    filteredTemplatePresets,
    createPresetConfig
  })
}

export type TemplatePresetModel = ReturnType<typeof useTemplatePresets>
