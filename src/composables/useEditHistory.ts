import { computed, nextTick, onUnmounted, reactive, ref, watch } from 'vue'
import type { IDrawStampConfig } from '../DrawStampTypes'

// Keep view-only ruler changes out of document history.
const serialize = (config: IDrawStampConfig) => JSON.stringify(config)
const signature = (config: IDrawStampConfig) => JSON.stringify(config, (key, value) => key === 'ruler' ? undefined : value)

export function useEditHistory(getConfig: () => IDrawStampConfig | null, apply: (config: IDrawStampConfig) => Promise<void>) {
  const entries = ref<string[]>([])
  const position = ref(-1)
  const pending = ref(false)
  const busy = ref(false)
  let gesture = false
  let enabled = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let lastSignature = ''

  const commit = () => {
    clearTimeout(timer)
    const config = getConfig()
    if (!enabled || busy.value || !config) return
    const currentSignature = signature(config)
    pending.value = false
    if (currentSignature === lastSignature) return
    entries.value = entries.value.slice(0, position.value + 1)
    entries.value.push(serialize(config))
    // Bound memory as well as step count for image-heavy documents.
    while (entries.value.length > 2 && (entries.value.length > 50 || entries.value.reduce((n, item) => n + item.length, 0) > 24_000_000)) entries.value.shift()
    position.value = entries.value.length - 1
    lastSignature = currentSignature
  }
  const start = () => { enabled = true; commit() }
  watch(getConfig, (config) => {
    if (!enabled || busy.value || !config) return
    pending.value = signature(config) !== lastSignature
    clearTimeout(timer)
    if (pending.value && !gesture) timer = setTimeout(commit, 450)
  }, { deep: true })

  const move = async (direction: number) => {
    if (busy.value) return
    commit()
    const target = position.value + direction
    if (target < 0 || target >= entries.value.length) return
    busy.value = true
    try {
      const config = JSON.parse(entries.value[target]) as IDrawStampConfig
      // Keep the user's current ruler settings when restoring a document.
      if (getConfig()?.ruler) config.ruler = JSON.parse(JSON.stringify(getConfig()!.ruler))
      await apply(config)
      await nextTick()
      position.value = target
      lastSignature = signature(getConfig() || config)
      pending.value = false
    } finally { busy.value = false }
  }
  const beginGesture = (event: PointerEvent) => {
    if ((event.target as HTMLElement)?.matches('input[type="range"], canvas')) { commit(); gesture = true }
  }
  const endGesture = () => { gesture = false; void nextTick(commit) }
  const undo = () => move(-1)
  const redo = () => move(1)
  const canUndo = computed(() => !busy.value && (pending.value || position.value > 0))
  const canRedo = computed(() => !busy.value && !pending.value && position.value < entries.value.length - 1)
  const onKeydown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null
    // Preserve native text undo and do not change the document behind a dialog.
    if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]') || document.querySelector('.extractor-overlay, .legal-dialog-overlay, .stamp-library-overlay')) return
    if (!(event.metaKey || event.ctrlKey) || event.altKey) return
    const key = event.key.toLowerCase()
    if (key === 'z' || (key === 'y' && event.ctrlKey)) {
      event.preventDefault()
      void ((event.shiftKey || key === 'y') ? redo() : undo())
    }
  }
  onUnmounted(() => clearTimeout(timer))
  return reactive({ start, commit, beginGesture, endGesture, undo, redo, canUndo, canRedo, onKeydown })
}
