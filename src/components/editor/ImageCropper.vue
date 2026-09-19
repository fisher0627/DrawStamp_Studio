<template>
  <div class="cropper">
    <p>{{ tr('在原图上拖动框选印章，再进行提取。', 'Drag around the stamp to extract only that area.') }}</p>
    <canvas ref="canvas" aria-label="框选印章 / Select stamp area" @pointerdown="start" @pointermove="move" @pointerup="end" @pointercancel="cancel" />
    <button type="button" @click="reset">{{ tr('使用整张图片', 'Use full image') }}</button>
  </div>
</template>
<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { StampCrop } from '../../utils/extractStampImage'
const props = defineProps<{ source: string }>()
const emit = defineEmits<{ (e: 'crop', value: StampCrop | undefined): void }>()
const { locale } = useI18n()
const tr = (zh: string, en: string) => locale.value === 'zh' ? zh : en
const canvas = ref<HTMLCanvasElement | null>(null)
let image: HTMLImageElement | null = null
let anchor: { x: number; y: number } | null = null
let box: StampCrop | undefined
let revision = 0
const paint = () => {
  const el = canvas.value; const ctx = el?.getContext('2d')
  if (!el || !ctx || !image) return
  ctx.clearRect(0, 0, el.width, el.height); ctx.drawImage(image, 0, 0, el.width, el.height)
  if (box) {
    ctx.fillStyle = '#17395b33'; ctx.fillRect(0, 0, el.width, el.height)
    ctx.drawImage(image, box.x / el.width * image.naturalWidth, box.y / el.height * image.naturalHeight, box.width / el.width * image.naturalWidth, box.height / el.height * image.naturalHeight, box.x, box.y, box.width, box.height)
    ctx.strokeStyle = '#2467aa'; ctx.lineWidth = 2; ctx.strokeRect(box.x, box.y, box.width, box.height)
  }
}
watch(() => props.source, async source => {
  const request = ++revision
  const next = new Image(); next.src = source
  try { await next.decode() } catch { return }
  if (request !== revision || !canvas.value) return
  image = next; anchor = null; box = undefined
  const scale = Math.min(1, 900 / next.naturalWidth)
  canvas.value.width = Math.round(next.naturalWidth * scale); canvas.value.height = Math.round(next.naturalHeight * scale)
  paint()
}, { immediate: true, flush: 'post' })
const point = (event: PointerEvent) => {
  const el = canvas.value!; const rect = el.getBoundingClientRect()
  return { x: Math.max(0, Math.min(el.width, (event.clientX - rect.left) * el.width / rect.width)), y: Math.max(0, Math.min(el.height, (event.clientY - rect.top) * el.height / rect.height)) }
}
const start = (event: PointerEvent) => { if (event.button !== 0) return; anchor = point(event); canvas.value?.setPointerCapture(event.pointerId) }
const move = (event: PointerEvent) => {
  if (!anchor) return
  const p = point(event); box = { x: Math.min(p.x, anchor.x), y: Math.min(p.y, anchor.y), width: Math.abs(p.x - anchor.x), height: Math.abs(p.y - anchor.y) }; paint()
}
const end = (event: PointerEvent) => {
  if (!anchor || !canvas.value || !image) return
  move(event); anchor = null
  if (!box || box.width < 3 || box.height < 3) { reset(); return }
  const sx = image.naturalWidth / canvas.value.width; const sy = image.naturalHeight / canvas.value.height
  emit('crop', { x: Math.floor(box.x * sx), y: Math.floor(box.y * sy), width: Math.round(box.width * sx), height: Math.round(box.height * sy) })
}
const cancel = () => { anchor = null; reset() }
const reset = () => { box = undefined; paint(); emit('crop', undefined) }
onUnmounted(() => { revision++; image = null })
</script>
<style scoped>
.cropper { text-align:center } p { font-size:12px; color:#64748b } canvas { display:block; max-width:100%; max-height:300px; margin:8px auto; touch-action:none; cursor:crosshair } button { border:1px solid #ccd5df; border-radius:6px; background:white; padding:6px 10px; cursor:pointer }
</style>
