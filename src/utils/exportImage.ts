// Write physical resolution into PNG pHYs / JPEG JFIF, rather than only changing pixels.
const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff
  for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0) }
  return (crc ^ 0xffffffff) >>> 0
}
export function withImageDpi(bytes: Uint8Array, format: 'png' | 'jpeg', dpi: number): Uint8Array {
  if (!Number.isInteger(dpi) || dpi < 1 || dpi > 1200) throw new Error('Invalid DPI')
  if (format === 'jpeg') {
    const result = bytes.slice()
    // Canvas JPEG encoders normally include a JFIF APP0 segment. If absent, insert one.
    let offset = 2
    while (offset + 16 <= result.length && result[offset] === 0xff) {
      const marker = result[offset + 1]
      if (marker === 0xda || marker === 0xd9) break
      const length = (result[offset + 2] << 8) | result[offset + 3]
      if (marker === 0xe0 && String.fromCharCode(...result.slice(offset + 4, offset + 9)) === 'JFIF\0') {
        result[offset + 11] = 1
        result[offset + 12] = dpi >> 8; result[offset + 13] = dpi & 255
        result[offset + 14] = dpi >> 8; result[offset + 15] = dpi & 255
        return result
      }
      if (length < 2) break
      offset += length + 2
    }
    const jfif = new Uint8Array([255,224,0,16,74,70,73,70,0,1,1,1,dpi >> 8,dpi & 255,dpi >> 8,dpi & 255,0,0])
    const output = new Uint8Array(bytes.length + jfif.length); output.set(bytes.slice(0, 2)); output.set(jfif, 2); output.set(bytes.slice(2), 2 + jfif.length); return output
  }
  const chunk = new Uint8Array(21); const view = new DataView(chunk.buffer)
  view.setUint32(0, 9); chunk.set([112,72,89,115], 4)
  const ppm = Math.round(dpi / 0.0254)
  view.setUint32(8, ppm); view.setUint32(12, ppm); chunk[16] = 1; view.setUint32(17, crc32(chunk.slice(4, 17)))
  const parts: Uint8Array[] = [bytes.slice(0, 8)]
  let offset = 8
  while (offset + 12 <= bytes.length) {
    const length = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0)
    const type = String.fromCharCode(...bytes.slice(offset + 4, offset + 8))
    if (type !== 'pHYs') parts.push(bytes.slice(offset, offset + length + 12))
    if (type === 'IHDR') parts.push(chunk)
    offset += length + 12
  }
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  offset = 0; for (const part of parts) { output.set(part, offset); offset += part.length }
  return output
}
export async function downloadStampImage(dataUrl: string, format: 'png' | 'jpeg' | 'svg', filename: string, dpi?: number) {
  let blob: Blob
  if (format === 'svg') {
    const image = new Image(); image.src = dataUrl; await image.decode()
    const width = image.naturalWidth; const height = image.naturalHeight
    const units = dpi ? `width="${width / dpi * 25.4}mm" height="${height / dpi * 25.4}mm"` : `width="${width}" height="${height}"`
    blob = new Blob([`<svg xmlns="http://www.w3.org/2000/svg" ${units} viewBox="0 0 ${width} ${height}"><image href="${dataUrl}" width="${width}" height="${height}"/></svg>`], { type: 'image/svg+xml' })
  } else {
    const raw = Uint8Array.from(atob(dataUrl.split(',')[1]), char => char.charCodeAt(0))
    blob = new Blob([dpi ? withImageDpi(raw, format, dpi) : raw], { type: `image/${format}` })
  }
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a'); link.href = url; link.download = `${filename.trim().replace(/[\\/:*?"<>|]/g, '_') || 'stamp'}.${format === 'jpeg' ? 'jpg' : format}`; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
