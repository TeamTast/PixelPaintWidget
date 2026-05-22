import type { EditorMode } from './state'
import {
  canvas,
  canvasWrap,
  context,
  eraseBtn,
  gridBtn,
  paintBtn,
  paletteEl,
} from './dom'
import { state } from './state'
import { clamp, keyFor } from '../shared/utils'

const DEFAULT_CELL_COLOR = '#F3F4F6'
const GRID_STROKE_COLOR = '#E5E7EB'

export function drawCell(x: number, y: number): void {
  const key = keyFor(x, y)
  const color = state.pixels[key] || DEFAULT_CELL_COLOR
  const size = state.cellSize
  const gap = state.gap
  const px = x * (size + gap)
  const py = y * (size + gap)
  context.fillStyle = color
  context.fillRect(px, py, size, size)
  if (state.showGrid) {
    context.strokeStyle = GRID_STROKE_COLOR
    context.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1)
  }
}

export function drawAll(): void {
  if (!context) {
    return
  }
  context.clearRect(0, 0, canvas.width, canvas.height)
  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      drawCell(x, y)
    }
  }
}

export function resizeCanvas(): void {
  const size = state.cellSize
  const gap = state.gap
  canvas.width = state.width * (size + gap) - gap
  canvas.height = state.height * (size + gap) - gap
  canvas.style.width = `${canvas.width}px`
  canvas.style.height = `${canvas.height}px`
  canvas.style.transformOrigin = '0 0'
  canvas.style.transform = `scale(${state.zoom})`
  drawAll()
}

export function updateCursor(): void {
  const size = state.brushSize * state.cellSize * state.zoom
  const radius = Math.max(2, Math.floor(size / 2))
  const cursorSize = radius * 2 + 2
  const center = cursorSize / 2
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${cursorSize}" height="${cursorSize}" viewBox="0 0 ${cursorSize} ${cursorSize}">` +
    `<circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#111827" stroke-width="1" />` +
    `<circle cx="${center}" cy="${center}" r="1" fill="#111827" />` +
    '</svg>'
  const encoded = encodeURIComponent(svg)
  canvas.style.cursor = `url("data:image/svg+xml;utf8,${encoded}") ${center} ${center}, crosshair`
}

export function applyZoom(
  nextZoom: number,
  focusX: number,
  focusY: number,
): void {
  const clamped = clamp(nextZoom, state.minZoom, state.maxZoom)
  if (clamped === state.zoom) {
    return
  }

  const prevZoom = state.zoom
  state.zoom = clamped
  canvas.style.transformOrigin = '0 0'
  canvas.style.transform = `scale(${state.zoom})`

  const rect = canvasWrap.getBoundingClientRect()
  const offsetX = focusX - rect.left
  const offsetY = focusY - rect.top
  const scrollX = canvasWrap.scrollLeft + offsetX
  const scrollY = canvasWrap.scrollTop + offsetY
  const ratio = state.zoom / prevZoom

  canvasWrap.scrollLeft = scrollX * ratio - offsetX
  canvasWrap.scrollTop = scrollY * ratio - offsetY
}

export function paintAt(x: number, y: number): void {
  if (x < 0 || y < 0 || x >= state.width || y >= state.height) {
    return
  }
  const half = Math.floor(state.brushSize / 2)
  for (let by = y - half; by <= y + half; by += 1) {
    for (let bx = x - half; bx <= x + half; bx += 1) {
      if (bx < 0 || by < 0 || bx >= state.width || by >= state.height) {
        continue
      }
      const key = keyFor(bx, by)
      if (state.mode === 'erase') {
        if (!state.pixels[key]) {
          continue
        }
        delete state.pixels[key]
        drawCell(bx, by)
        continue
      }
      if (state.pixels[key] === state.activeColor) {
        continue
      }
      state.pixels[key] = state.activeColor
      drawCell(bx, by)
    }
  }
}

export function paintLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): void {
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy
  let cx = x0
  let cy = y0
  while (true) {
    paintAt(cx, cy)
    if (cx === x1 && cy === y1) {
      break
    }
    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      cx += sx
    }
    if (e2 < dx) {
      err += dx
      cy += sy
    }
  }
}

export function paintAtEvent(event: MouseEvent): void {
  const rect = canvas.getBoundingClientRect()
  const size = (state.cellSize + state.gap) * state.zoom
  const x = Math.floor((event.clientX - rect.left) / size)
  const y = Math.floor((event.clientY - rect.top) / size)

  if (state.lastX === -1) {
    paintAt(x, y)
  } else {
    paintLine(state.lastX, state.lastY, x, y)
  }
  state.lastX = x
  state.lastY = y
}

export function pickAtEvent(event: MouseEvent): void {
  const rect = canvas.getBoundingClientRect()
  const size = (state.cellSize + state.gap) * state.zoom
  const x = Math.floor((event.clientX - rect.left) / size)
  const y = Math.floor((event.clientY - rect.top) / size)

  if (x < 0 || y < 0 || x >= state.width || y >= state.height) {
    return
  }

  const key = keyFor(x, y)
  const color = state.pixels[key]
  if (!color) {
    updateMode('erase')
    updateCursor()
    return
  }

  updateMode('paint')
  setActiveColor(color)
  updateCursor()
}

export function updateMode(nextMode: EditorMode): void {
  state.mode = nextMode
  paintBtn.classList.toggle('active', nextMode === 'paint')
  eraseBtn.classList.toggle('active', nextMode === 'erase')
}

export function setActiveColor(color: string): void {
  state.activeColor = color
  const swatches = paletteEl.querySelectorAll('.swatch')
  swatches.forEach((swatch) => {
    swatch.classList.toggle(
      'active',
      (swatch as HTMLElement).dataset.color === color,
    )
  })
}

export function updateGridButton(): void {
  gridBtn.textContent = state.showGrid ? 'On' : 'Off'
}
