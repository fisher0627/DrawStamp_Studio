import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { IDrawStampConfig } from '../DrawStampTypes'

const DRAFT_STORAGE_KEY = 'drawstamp-studio:draft:v1'
const DRAFT_SAVE_DELAY = 500
const DRAFT_VERSION_INTERVAL = 30 * 1000
const MAX_DRAFT_VERSIONS = 5

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

/**
 * 本地自动草稿：保存、版本列表、恢复与清除
 */
export function useLocalDraft(options: {
  getConfig: () => IDrawStampConfig | null
  onRestore: (config: IDrawStampConfig) => void
}) {
  const { t, locale } = useI18n()

  const draftSavedAt = ref<number | null>(null)
  const draftSaveState = ref<'idle' | 'saved' | 'saving' | 'failed'>('idle')
  const hasLocalDraft = ref(false)
  const draftVersions = ref<LocalDraftItem[]>([])
  const isDraftMenuOpen = ref(false)

  let draftSaveTimer: number | undefined
  let suppressDraftSave = false

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
    const title = companyName || stampType || t('studio.editor.untitledDraft')
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
    const config = options.getConfig()
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
    if (!draft) return

    suppressDraftSave = true
    const draftConfig = cloneConfig(draft.config)
    await options.onRestore(draftConfig)
    draftSavedAt.value = draft.savedAt
    draftSaveState.value = 'saved'
    isDraftMenuOpen.value = false

    window.setTimeout(() => {
      suppressDraftSave = false
    }, DRAFT_SAVE_DELAY)
  }

  const handleBeforeUnload = () => {
    if (draftSaveTimer) {
      window.clearTimeout(draftSaveTimer)
      draftSaveTimer = undefined
    }
    saveLocalDraftNow(options.getConfig())
  }

  const draftStatusLabel = computed(() => {
    if (draftSaveState.value === 'saving') return t('studio.editor.draft.saving')
    if (draftSaveState.value === 'failed') return t('studio.editor.draft.unsaved')
    if (!draftSavedAt.value) return hasLocalDraft.value ? t('studio.editor.draft.restored') : t('studio.editor.draft.autoSave')

    const savedDate = new Date(draftSavedAt.value)
    const time = savedDate.toLocaleTimeString(locale.value === 'zh' ? 'zh-CN' : 'en', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    return t('studio.editor.draft.savedAt', { time })
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
    const time = date.toLocaleTimeString(locale.value === 'zh' ? 'zh-CN' : 'en', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    if (isToday) return t('studio.editor.draft.todayAt', { time })
    return date.toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  return reactive({
    draftSavedAt,
    draftSaveState,
    hasLocalDraft,
    draftVersions,
    isDraftMenuOpen,
    draftStatusLabel,
    draftStatusClass,
    formatDraftTime,
    cloneConfig,
    readLocalDrafts,
    saveLocalDraftNow,
    scheduleLocalDraftSave,
    clearLocalDraft,
    retryDraftSave,
    handleDraftStatusClick,
    restoreDraftVersion,
    handleBeforeUnload
  })
}

export type LocalDraftModel = ReturnType<typeof useLocalDraft>
