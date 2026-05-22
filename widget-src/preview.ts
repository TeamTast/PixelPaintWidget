import type { PixelMap } from '../shared/messages'
import { CELL_SIZE, DEFAULT_CELL_COLOR, GRID_STROKE_COLOR } from './constants'

export function buildPreviewSvg(
  width: number,
  height: number,
  pixels: PixelMap,
  showGrid: boolean,
): string {
  const pxWidth = width * CELL_SIZE
  const pxHeight = height * CELL_SIZE
  let rects = ''

  for (const key of Object.keys(pixels)) {
    const parts = key.split(':')
    const x = Number(parts[0])
    const y = Number(parts[1])
    if (x < 0 || y < 0 || x >= width || y >= height) {
      continue
    }
    const fill = pixels[key]
    rects += `<rect x="${x * CELL_SIZE}" y="${y * CELL_SIZE}" width="${CELL_SIZE}" height="${CELL_SIZE}" fill="${fill}" />`
  }

  let grid = ''
  if (showGrid) {
    let lines = ''
    for (let x = 0; x <= width; x += 1) {
      const xPos = x * CELL_SIZE
      lines += `M${xPos} 0 V${pxHeight} `
    }
    for (let y = 0; y <= height; y += 1) {
      const yPos = y * CELL_SIZE
      lines += `M0 ${yPos} H${pxWidth} `
    }
    grid = `<path d="${lines}" stroke="${GRID_STROKE_COLOR}" stroke-width="1" shape-rendering="crispEdges" />`
  }

  return `<svg width="${pxWidth}" height="${pxHeight}" viewBox="0 0 ${pxWidth} ${pxHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${DEFAULT_CELL_COLOR}" />${rects}${grid}</svg>`
}
