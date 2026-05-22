import type { PaletteSwatch, PixelMap } from '../shared/messages'

export type EditorMode = 'paint' | 'erase'

export interface EditorState {
  width: number
  height: number
  minSize: number
  maxSize: number
  cellSize: number
  gap: number
  mode: EditorMode
  activeColor: string
  showGrid: boolean
  brushSize: number
  minBrushSize: number
  maxBrushSize: number
  palette: readonly PaletteSwatch[]
  pixels: PixelMap
  isDrawing: boolean
  isPanning: boolean
  panStartX: number
  panStartY: number
  panScrollLeft: number
  panScrollTop: number
  zoom: number
  minZoom: number
  maxZoom: number
  lastX: number
  lastY: number
  uiMinWidth: number
  uiMinHeight: number
  uiMaxWidth: number
  uiMaxHeight: number
}

export const state: EditorState = {
  width: 0,
  height: 0,
  minSize: 4,
  maxSize: 96,
  cellSize: 16,
  gap: 1,
  mode: 'paint',
  activeColor: '#6B4F2A',
  showGrid: true,
  brushSize: 1,
  minBrushSize: 1,
  maxBrushSize: 8,
  palette: [],
  pixels: {},
  isDrawing: false,
  isPanning: false,
  panStartX: 0,
  panStartY: 0,
  panScrollLeft: 0,
  panScrollTop: 0,
  zoom: 1,
  minZoom: 0.25,
  maxZoom: 4,
  lastX: -1,
  lastY: -1,
  uiMinWidth: 520,
  uiMinHeight: 420,
  uiMaxWidth: 1600,
  uiMaxHeight: 1200,
}
