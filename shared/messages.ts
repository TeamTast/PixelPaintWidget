export type PixelMap = Record<string, string>

export interface PaletteSwatch {
  name: string
  color: string
}

export interface InitMessage {
  type: 'init'
  width: number
  height: number
  pixels: PixelMap
  palette: readonly PaletteSwatch[]
  activeColor: string
  showGrid: boolean
  minSize: number
  maxSize: number
  cellSize: number
  gap: number
  brushSize: number
  minBrushSize: number
  maxBrushSize: number
  editorWidth: number
  editorHeight: number
  uiMinWidth: number
  uiMinHeight: number
  uiMaxWidth: number
  uiMaxHeight: number
}

export interface ApplyMessage {
  type: 'apply'
  width: number
  height: number
  pixels: PixelMap
  activeColor: string
  showGrid: boolean
  brushSize: number
}

export interface ResizeUiMessage {
  type: 'resize-ui'
  width: number
  height: number
}

export interface CloseMessage {
  type: 'close'
}

export type UiToWidgetMessage = ApplyMessage | ResizeUiMessage | CloseMessage
export type WidgetToUiMessage = InitMessage

export interface PluginMessageEnvelope<T> {
  pluginMessage: T
}

export interface WindowMessageEvent<T> {
  data: PluginMessageEnvelope<T>
}
