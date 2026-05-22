import type { UiToWidgetMessage } from '../shared/messages'
import { clamp } from '../shared/utils'
import {
  applyZoom,
  drawAll,
  paintAtEvent,
  pickAtEvent,
  resizeCanvas,
  updateCursor,
  updateGridButton,
  updateMode,
} from './canvas-renderer'
import {
  applyBtn,
  applySizeBtn,
  applyWindowBtn,
  brushSizeInput,
  canvas,
  canvasWrap,
  eraseBtn,
  gridBtn,
  heightInput,
  paintBtn,
  uiHeightInput,
  uiWidthInput,
  widthInput,
} from './dom'
import { redo, saveHistory, undo } from './history'
import { state } from './state'

function postToWidget(message: UiToWidgetMessage): void {
  parent.postMessage({ pluginMessage: message }, '*')
}

export function bindInputHandlers(): void {
  canvas.addEventListener('mousedown', (event) => {
    if (event.button === 1) {
      event.preventDefault()
      state.isPanning = true
      state.panStartX = event.clientX
      state.panStartY = event.clientY
      state.panScrollLeft = canvasWrap.scrollLeft
      state.panScrollTop = canvasWrap.scrollTop
      canvas.style.cursor = 'grabbing'
      return
    }
    if (event.button === 2) {
      return
    }
    state.isDrawing = true
    state.lastX = -1
    state.lastY = -1
    saveHistory()
    paintAtEvent(event)
  })

  canvas.addEventListener('mousemove', (event) => {
    if (state.isPanning) {
      const dx = event.clientX - state.panStartX
      const dy = event.clientY - state.panStartY
      canvasWrap.scrollLeft = state.panScrollLeft - dx
      canvasWrap.scrollTop = state.panScrollTop - dy
      return
    }
    if (!state.isDrawing) {
      return
    }
    paintAtEvent(event)
  })

  window.addEventListener('mouseup', () => {
    state.isDrawing = false
    if (state.isPanning) {
      state.isPanning = false
      updateCursor()
    }
  })

  canvas.addEventListener('mouseleave', () => {
    if (state.isPanning) {
      state.isPanning = false
      updateCursor()
    }
  })

  canvasWrap.addEventListener('wheel', (event) => {
    event.preventDefault()
    if (event.ctrlKey) {
      const delta = event.deltaY
      const nextSize = clamp(
        state.brushSize + (delta > 0 ? -1 : 1),
        state.minBrushSize,
        state.maxBrushSize,
      )
      if (nextSize !== state.brushSize) {
        state.brushSize = nextSize
        brushSizeInput.value = String(nextSize)
        updateCursor()
      }
      return
    }
    const delta = event.deltaY
    const zoomFactor = delta > 0 ? 0.9 : 1.1
    applyZoom(state.zoom * zoomFactor, event.clientX, event.clientY)
  })

  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    pickAtEvent(event)
  })

  paintBtn.addEventListener('click', () => updateMode('paint'))
  eraseBtn.addEventListener('click', () => updateMode('erase'))
  gridBtn.addEventListener('click', () => {
    state.showGrid = !state.showGrid
    updateGridButton()
    drawAll()
  })

  applySizeBtn.addEventListener('click', () => {
    const nextWidth = clamp(
      Number(widthInput.value),
      state.minSize,
      state.maxSize,
    )
    const nextHeight = clamp(
      Number(heightInput.value),
      state.minSize,
      state.maxSize,
    )

    const nextPixels: typeof state.pixels = {}
    Object.keys(state.pixels).forEach((key) => {
      const parts = key.split(':')
      const x = Number(parts[0])
      const y = Number(parts[1])
      if (x >= 0 && x < nextWidth && y >= 0 && y < nextHeight) {
        nextPixels[key] = state.pixels[key]
      }
    })

    state.width = nextWidth
    state.height = nextHeight
    state.pixels = nextPixels
    widthInput.value = String(nextWidth)
    heightInput.value = String(nextHeight)
    resizeCanvas()
  })

  applyWindowBtn.addEventListener('click', () => {
    const nextWidth = clamp(
      Number(uiWidthInput.value),
      state.uiMinWidth,
      state.uiMaxWidth,
    )
    const nextHeight = clamp(
      Number(uiHeightInput.value),
      state.uiMinHeight,
      state.uiMaxHeight,
    )
    uiWidthInput.value = String(nextWidth)
    uiHeightInput.value = String(nextHeight)
    postToWidget({
      type: 'resize-ui',
      width: nextWidth,
      height: nextHeight,
    })
  })

  applyBtn.addEventListener('click', () => {
    postToWidget({
      type: 'apply',
      width: state.width,
      height: state.height,
      pixels: state.pixels,
      activeColor: state.activeColor,
      showGrid: state.showGrid,
      brushSize: state.brushSize,
    })
  })

  brushSizeInput.addEventListener('change', () => {
    const nextSize = clamp(
      Number(brushSizeInput.value),
      state.minBrushSize,
      state.maxBrushSize,
    )
    state.brushSize = nextSize
    brushSizeInput.value = String(nextSize)
    updateCursor()
  })

  window.addEventListener('keydown', (event) => {
    const mod = event.ctrlKey || event.metaKey
    if (!mod) {
      return
    }
    if (event.key === 'z' && !event.shiftKey) {
      event.preventDefault()
      undo()
      drawAll()
    } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
      event.preventDefault()
      redo()
      drawAll()
    }
  })
}
