export type ExtractStampOptions = {
  threshold: number
  cleanup: number
  targetColor: string
  transparentBackground: boolean
  preserveShading: boolean
}

export type ExtractStampResult = {
  dataUrl: string
  width: number
  height: number
  redPixels: number
  totalPixels: number
}

const MAX_SOURCE_SIZE = 1400

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const parseHexColor = (hex: string) => {
  const normalized = hex.replace('#', '').trim()
  const value = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized.padEnd(6, '0').slice(0, 6)

  return {
    r: parseInt(value.slice(0, 2), 16) || 200,
    g: parseInt(value.slice(2, 4), 16) || 0,
    b: parseInt(value.slice(4, 6), 16) || 0
  }
}

const getHue = (r: number, g: number, b: number) => {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  if (delta === 0) return 0

  let hue = 0
  if (max === r) {
    hue = ((g - b) / delta) % 6
  } else if (max === g) {
    hue = (b - r) / delta + 2
  } else {
    hue = (r - g) / delta + 4
  }

  return (hue * 60 + 360) % 360
}

const createMask = (data: Uint8ClampedArray, width: number, height: number, threshold: number) => {
  const mask = new Uint8Array(width * height)
  const sensitivity = 18 + threshold * 0.95
  let redPixels = 0

  for (let index = 0; index < width * height; index += 1) {
    const offset = index * 4
    const r = data[offset]
    const g = data[offset + 1]
    const b = data[offset + 2]
    const a = data[offset + 3]
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    const hue = getHue(r, g, b)
    const redHue = hue <= 30 || hue >= 335
    const redDominance = r - Math.max(g, b)
    const warmRed = r > g * 1.18 && r > b * 1.18
    const isRed = a > 0 && r > 72 && saturation > 0.18 && redDominance > sensitivity && (redHue || warmRed)

    if (isRed) {
      mask[index] = 1
      redPixels += 1
    }
  }

  return { mask, redPixels }
}

const cleanMask = (source: Uint8Array, width: number, height: number, level: number) => {
  if (level <= 0) return source

  let current = source
  const iterations = clamp(Math.round(level), 1, 4)

  for (let pass = 0; pass < iterations; pass += 1) {
    const next = new Uint8Array(current)

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = y * width + x
        let neighbors = 0

        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue
            neighbors += current[(y + dy) * width + x + dx]
          }
        }

        if (current[index] && neighbors <= 1) {
          next[index] = 0
        } else if (!current[index] && neighbors >= 7) {
          next[index] = 1
        }
      }
    }

    current = next
  }

  return current
}

const getBounds = (mask: Uint8Array, width: number, height: number) => {
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!mask[y * width + x]) continue
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }

  if (maxX < minX || maxY < minY) return null

  const padding = 12
  return {
    x: clamp(minX - padding, 0, width - 1),
    y: clamp(minY - padding, 0, height - 1),
    width: clamp(maxX - minX + padding * 2, 1, width),
    height: clamp(maxY - minY + padding * 2, 1, height)
  }
}

export async function extractStampFromFile(file: File, options: ExtractStampOptions): Promise<ExtractStampResult> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SOURCE_SIZE / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = width
  sourceCanvas.height = height
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true })
  if (!sourceCtx) {
    bitmap.close()
    throw new Error('Canvas is not available')
  }

  sourceCtx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const imageData = sourceCtx.getImageData(0, 0, width, height)
  const { mask: rawMask, redPixels } = createMask(imageData.data, width, height, options.threshold)
  const mask = cleanMask(rawMask, width, height, options.cleanup)
  const bounds = getBounds(mask, width, height)

  if (!bounds || redPixels < 20) {
    throw new Error('未识别到明显的红色印章区域')
  }

  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = bounds.width
  outputCanvas.height = bounds.height
  const outputCtx = outputCanvas.getContext('2d')
  if (!outputCtx) {
    throw new Error('Canvas is not available')
  }

  if (!options.transparentBackground) {
    outputCtx.fillStyle = '#ffffff'
    outputCtx.fillRect(0, 0, bounds.width, bounds.height)
  }

  const outputData = outputCtx.createImageData(bounds.width, bounds.height)
  const target = parseHexColor(options.targetColor)

  for (let y = 0; y < bounds.height; y += 1) {
    for (let x = 0; x < bounds.width; x += 1) {
      const sourceX = bounds.x + x
      const sourceY = bounds.y + y
      const sourceIndex = sourceY * width + sourceX
      if (!mask[sourceIndex]) continue

      const sourceOffset = sourceIndex * 4
      const outputOffset = (y * bounds.width + x) * 4
      const r = imageData.data[sourceOffset]
      const g = imageData.data[sourceOffset + 1]
      const b = imageData.data[sourceOffset + 2]
      const originalAlpha = imageData.data[sourceOffset + 3]
      const dominance = r - Math.max(g, b)
      const shade = options.preserveShading ? clamp((r + dominance * 0.65) / 255, 0.48, 1) : 1
      const alpha = options.transparentBackground
        ? clamp(135 + dominance * 1.35, 90, 255)
        : clamp(185 + dominance, 120, 255)

      outputData.data[outputOffset] = Math.round(target.r * shade)
      outputData.data[outputOffset + 1] = Math.round(target.g * shade)
      outputData.data[outputOffset + 2] = Math.round(target.b * shade)
      outputData.data[outputOffset + 3] = Math.min(alpha, originalAlpha)
    }
  }

  outputCtx.putImageData(outputData, 0, 0)

  return {
    dataUrl: outputCanvas.toDataURL('image/png'),
    width: bounds.width,
    height: bounds.height,
    redPixels,
    totalPixels: width * height
  }
}
