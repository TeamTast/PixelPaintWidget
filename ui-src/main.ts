import type { InitMessage, WindowMessageEvent } from '../shared/messages'
import {
  resizeCanvas,
  setActiveColor,
  updateCursor,
  updateGridButton,
} from './canvas-renderer'
import {
  brushSizeInput,
  heightInput,
  uiHeightInput,
  uiWidthInput,
  widthInput,
} from './dom'
import { bindInputHandlers } from './input-handler'
import { renderPalette } from './palette-view'
import { state } from './state'

function handleInit(message: InitMessage): void {
  state.width = message.width
  state.height = message.height
  state.minSize = message.minSize
  state.maxSize = message.maxSize
  state.cellSize = message.cellSize
  state.gap = message.gap
  state.uiMinWidth = message.uiMinWidth
  state.uiMinHeight = message.uiMinHeight
  state.uiMaxWidth = message.uiMaxWidth
  state.uiMaxHeight = message.uiMaxHeight
  state.palette = message.palette || []
  state.activeColor = message.activeColor || state.activeColor
  state.showGrid = message.showGrid ?? state.showGrid
  state.brushSize = message.brushSize || state.brushSize
  state.pixels = message.pixels || {}

  widthInput.min = String(state.minSize)
  heightInput.min = String(state.minSize)
  widthInput.max = String(state.maxSize)
  heightInput.max = String(state.maxSize)
  widthInput.value = String(state.width)
  heightInput.value = String(state.height)
  uiWidthInput.min = String(state.uiMinWidth)
  uiWidthInput.max = String(state.uiMaxWidth)
  uiHeightInput.min = String(state.uiMinHeight)
  uiHeightInput.max = String(state.uiMaxHeight)
  uiWidthInput.value = String(message.editorWidth)
  uiHeightInput.value = String(message.editorHeight)
  state.minBrushSize = message.minBrushSize
  state.maxBrushSize = message.maxBrushSize
  brushSizeInput.min = String(message.minBrushSize)
  brushSizeInput.max = String(message.maxBrushSize)
  brushSizeInput.value = String(state.brushSize)

  renderPalette()
  setActiveColor(state.activeColor)
  updateGridButton()
  updateCursor()
  resizeCanvas()
}

window.onmessage = (event: WindowMessageEvent<InitMessage>) => {
  const message = event.data.pluginMessage
  if (!message || message.type !== 'init') {
    return
  }
  handleInit(message)
}

bindInputHandlers()
