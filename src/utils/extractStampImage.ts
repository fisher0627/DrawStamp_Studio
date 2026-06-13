export type ExtractStampOptions = {
  threshold: number
  cleanup: number
  targetColor: string
  transparentBackground: boolean
  preserveShading: boolean
  edgeEnhance: boolean
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

const countMaskPixels = (mask: Uint8Array) => {
  let count = 0
  for (let index = 0; index < mask.length; index += 1) {
    count += mask[index]
  }
  return count
}

const createMask = (data: Uint8ClampedArray, width: number, height: number, threshold: number) => {
  const mask = new Uint8Array(width * height)
  const keepRange = clamp(threshold, 0, 100) / 100
  const strictness = 1 - keepRange
  const minDominance = 14 + strictness * 68
  const minSaturation = 0.1 + strictness * 0.18
  const minRed = 46 + strictness * 42
  const hueTolerance = 30 + keepRange * 16
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
    const redHue = hue <= hueTolerance || hue >= 360 - hueTolerance * 0.82
    const redDominance = r - Math.max(g, b)
    const warmRed = r > g * (1.08 + strictness * 0.2) && r > b * (1.08 + strictness * 0.2)
    const darkStampRed = r > 58 && redDominance > minDominance * 0.66 && saturation > minSaturation * 0.82
    const isRed = a > 0 && r > minRed && saturation > minSaturation && redDominance > minDominance && (redHue || warmRed || darkStampRed)

    if (isRed) {
      mask[index] = 1
      redPixels += 1
    }
  }

  return { mask, redPixels }
}

const smoothMask = (source: Uint8Array, width: number, height: number, iterations: number) => {
  let current = source

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

const removeSmallComponents = (source: Uint8Array, width: number, height: number, level: number) => {
  if (level <= 0) return source

  const current = new Uint8Array(source)
  const visited = new Uint8Array(width * height)
  const minArea = [0, 3, 7, 13, 22][clamp(Math.round(level), 0, 4)] || 3
  const queue: number[] = []
  const component: number[] = []

  for (let index = 0; index < current.length; index += 1) {
    if (!current[index] || visited[index]) continue

    queue.length = 0
    component.length = 0
    queue.push(index)
    visited[index] = 1

    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const point = queue[cursor]
      component.push(point)
      const x = point % width
      const y = Math.floor(point / width)

      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
          const neighbor = ny * width + nx
          if (!current[neighbor] || visited[neighbor]) continue
          visited[neighbor] = 1
          queue.push(neighbor)
        }
      }
    }

    if (component.length < minArea) {
      component.forEach(point => {
        current[point] = 0
      })
    }
  }

  return current
}

const enhanceEdges = (source: Uint8Array, width: number, height: number) => {
  const next = new Uint8Array(source)

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x
      let neighbors = 0

      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue
          neighbors += source[(y + dy) * width + x + dx]
        }
      }

      if (!source[index] && neighbors >= 5) {
        next[index] = 1
      } else if (source[index] && neighbors === 0) {
        next[index] = 0
      }
    }
  }

  return next
}

const cleanMask = (source: Uint8Array, width: number, height: number, level: number, edgeEnhance: boolean) => {
  let current = source
  const iterations = clamp(Math.round(level), 0, 4)

  if (iterations > 0) {
    current = smoothMask(current, width, height, Math.min(iterations, 2))
    current = removeSmallComponents(current, width, height, iterations)
  }

  if (edgeEnhance) {
    current = enhanceEdges(current, width, height)
  }

  return current
}

const getBounds = (mask: Uint8Array, width: number, height: number) => {
  const xValues: number[] = []
  const yValues: number[] = []

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!mask[y * width + x]) continue
      xValues.push(x)
      yValues.push(y)
    }
  }

  if (xValues.length === 0 || yValues.length === 0) return null

  xValues.sort((a, b) => a - b)
  yValues.sort((a, b) => a - b)

  const outlierRatio = xValues.length > 600 ? 0.006 : 0
  const minIndex = Math.floor((xValues.length - 1) * outlierRatio)
  const maxIndex = Math.ceil((xValues.length - 1) * (1 - outlierRatio))
  const minX = xValues[minIndex]
  const maxX = xValues[maxIndex]
  const minY = yValues[minIndex]
  const maxY = yValues[maxIndex]

  const padding = 12
  const cropX = clamp(minX - padding, 0, width - 1)
  const cropY = clamp(minY - padding, 0, height - 1)
  const cropMaxX = clamp(maxX + padding, cropX, width - 1)
  const cropMaxY = clamp(maxY + padding, cropY, height - 1)

  return {
    x: cropX,
    y: cropY,
    width: cropMaxX - cropX + 1,
    height: cropMaxY - cropY + 1
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
  const mask = cleanMask(rawMask, width, height, options.cleanup, options.edgeEnhance)
  const finalPixels = countMaskPixels(mask)
  const bounds = getBounds(mask, width, height)

  if (!bounds || finalPixels < 20) {
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
    redPixels: finalPixels || redPixels,
    totalPixels: width * height
  }
}
