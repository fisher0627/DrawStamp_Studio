<template>
  <div class="retouch">
    <div class="retouch-tools">
      <button type="button" :class="{ active: tool === 'erase' }" @click="tool = 'erase'">{{ tr('擦除', 'Erase') }}</button>
      <button type="button" :class="{ active: tool === 'restore' }" @click="tool = 'restore'">{{ tr('恢复', 'Restore') }}</button>
      <label>{{ tr('笔刷', 'Brush') }} <input v-model.number="brush" type="range" min="2" max="60" /> {{ brush }}</label>
      <button type="button" @click="undo" :disabled="!snapshots.length">{{ tr('撤销笔画', 'Undo stroke') }}</button>
      <button type="button" @click="reset">{{ tr('重置修边', 'Reset edits') }}</button>
    </div>
    <p>{{ tr('恢复笔刷可找回擦除的内容；调整提取参数或框选区域会重置修边。', 'Restore brings back erased pixels. Extraction settings or a new crop reset these edits.') }}</p>
    <div class="retouch-stage" :class="{ white }"><canvas ref="canvas" aria-label="修边画布 / Retouch canvas" @pointerdown="start" @pointermove="move" @pointerup="end" @pointercancel="end" /></div>
  </div>
</template>
<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const props = defineProps<{ source: string; white: boolean }>()
const emit = defineEmits<{ (e: 'update', dataUrl: string): void }>()
const { locale } = useI18n()
const tr = (zh: string, en: string) => locale.value === 'zh' ? zh : en
const canvas = ref<HTMLCanvasElement | null>(null)
const tool = ref<'erase' | 'restore'>('erase')
const brush = ref(16)
const snapshots = ref<ImageData[]>([])
let original: HTMLImageElement | null = null
let originalPixels: Uint8ClampedArray | null = null
let last: { x: number; y: number } | null = null
let revision = 0
const publish = () => { if (canvas.value) emit('update', canvas.value.toDataURL('image/png')) }
const reset = () => {
  const el = canvas.value; const ctx = el?.getContext('2d')
  if (!el || !ctx || !original) return
  ctx.clearRect(0, 0, el.width, el.height); ctx.drawImage(original, 0, 0); originalPixels = ctx.getImageData(0, 0, el.width, el.height).data; snapshots.value = []; publish()
}
watch(() => props.source, async source => {
  const request = ++revision; const image = new Image(); image.src = source
  try { await image.decode() } catch { return }
  if (revision !== request || !canvas.value) return
  original = image; last = null; canvas.value.width = image.naturalWidth; canvas.value.height = image.naturalHeight; reset()
}, { immediate: true, flush: 'post' })
const point = (event: PointerEvent) => {
  const el = canvas.value!; const rect = el.getBoundingClientRect()
  return { x: (event.clientX - rect.left) * el.width / rect.width, y: (event.clientY - rect.top) * el.height / rect.height }
}
const stroke = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const el = canvas.value; const ctx = el?.getContext('2d')
  if (!ctx || !el || !original) return
  if (!originalPixels) return
  const radius = brush.value * el.width / el.getBoundingClientRect().width / 2
  const left = Math.max(0, Math.floor(Math.min(a.x, b.x) - radius))
  const top = Math.max(0, Math.floor(Math.min(a.y, b.y) - radius))
  const right = Math.min(el.width, Math.ceil(Math.max(a.x, b.x) + radius))
  const bottom = Math.min(el.height, Math.ceil(Math.max(a.y, b.y) + radius))
  if (right <= left || bottom <= top) return
  const data = ctx.getImageData(left, top, right-left, bottom-top)
  const dx = b.x-a.x; const dy = b.y-a.y; const length = dx*dx+dy*dy
  for (let y=top; y<bottom; y++) for (let x=left; x<right; x++) {
    const t = length ? Math.max(0, Math.min(1, ((x-a.x)*dx+(y-a.y)*dy)/length)) : 0
    if ((x-a.x-t*dx)**2+(y-a.y-t*dy)**2 > radius*radius) continue
    const index = ((y-top)*data.width+x-left)*4
    if (tool.value === 'erase') data.data[index+3] = 0
    else {
      const source = (y*el.width+x)*4
      data.data.set(originalPixels.subarray(source, source+4), index)
    }
  }
  ctx.putImageData(data, left, top)
}
const start = (event: PointerEvent) => {
  if (event.button !== 0 || !original) return
  const el = canvas.value!; const ctx = el.getContext('2d')!
  snapshots.value.push(ctx.getImageData(0, 0, el.width, el.height))
  // Keep retouch undo memory below ~32 MB.
  const limit = Math.max(1, Math.min(15, Math.floor(32_000_000 / (el.width * el.height * 4))))
  if (snapshots.value.length > limit) snapshots.value.shift()
  last = point(event); el.setPointerCapture(event.pointerId); stroke(last, last)
}
const move = (event: PointerEvent) => { if (last) { const p = point(event); stroke(last, p); last = p } }
const end = () => { if (last) { last = null; publish() } }
const undo = () => { const previous = snapshots.value.pop(); if (previous) { canvas.value?.getContext('2d')?.putImageData(previous, 0, 0); publish() } }
onUnmounted(() => { revision++; original = null; originalPixels = null; snapshots.value = [] })
</script>
<style scoped>
.retouch { width:100% } .retouch-tools { display:flex; gap:6px; flex-wrap:wrap; align-items:center } button { border:1px solid #ccd5df; padding:6px 9px; border-radius:6px; background:white; cursor:pointer } button.active { background:#284b74; color:white } button:disabled { opacity:.4 } label { display:flex; align-items:center; gap:4px; font-size:12px } input { width:80px } p { color:#64748b; font-size:12px; line-height:1.5 } .retouch-stage { padding:12px; text-align:center; background:repeating-conic-gradient(#e5e7eb 0% 25%,white 0% 50%) 0 / 16px 16px } .retouch-stage.white { background:white } canvas { display:block; margin:auto; max-width:100%; max-height:260px; background:transparent; touch-action:none; cursor:crosshair }
</style>
