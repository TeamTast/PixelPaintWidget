import type { UiToWidgetMessage } from '../shared/messages'
import {
  CELL_SIZE,
  DEFAULT_BRUSH_SIZE,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  EDITOR_HEIGHT,
  EDITOR_WIDTH,
  GRID_GAP,
  MAX_BRUSH_SIZE,
  MAX_EDITOR_HEIGHT,
  MAX_EDITOR_WIDTH,
  MAX_SIZE,
  MIN_BRUSH_SIZE,
  MIN_EDITOR_HEIGHT,
  MIN_EDITOR_WIDTH,
  MIN_SIZE,
} from './constants'
import { EDITOR_HTML } from './editor-html'
import { PALETTE } from './palette'
import { buildPreviewSvg } from './preview'
import { clamp } from './utils'

const { widget } = figma
const { useSyncedState, usePropertyMenu, useEffect, AutoLayout, SVG } = widget

let uiResolve: (() => void) | null = null

function Widget() {
  const [width, setWidth] = useSyncedState('width', DEFAULT_WIDTH)
  const [height, setHeight] = useSyncedState('height', DEFAULT_HEIGHT)
  const [pixels, setPixels] = useSyncedState('pixels', {})
  const [showGrid, setShowGrid] = useSyncedState('showGrid', true)
  const [brushSize, setBrushSize] = useSyncedState(
    'brushSize',
    DEFAULT_BRUSH_SIZE,
  )
  const [editorWidth, setEditorWidth] = useSyncedState(
    'editorWidth',
    EDITOR_WIDTH,
  )
  const [editorHeight, setEditorHeight] = useSyncedState(
    'editorHeight',
    EDITOR_HEIGHT,
  )
  const [activeColor, setActiveColor] = useSyncedState(
    'activeColor',
    PALETTE[0].color,
  )

  useEffect(() => {
    figma.ui.onmessage = (message: UiToWidgetMessage) => {
      if (message.type === 'apply') {
        const nextWidth = clamp(message.width, MIN_SIZE, MAX_SIZE)
        const nextHeight = clamp(message.height, MIN_SIZE, MAX_SIZE)
        setWidth(nextWidth)
        setHeight(nextHeight)
        setPixels(message.pixels || {})
        if (message.activeColor) {
          setActiveColor(message.activeColor)
        }
        if (typeof message.showGrid === 'boolean') {
          setShowGrid(message.showGrid)
        }
        if (typeof message.brushSize === 'number') {
          setBrushSize(clamp(message.brushSize, MIN_BRUSH_SIZE, MAX_BRUSH_SIZE))
        }
      }

      if (message.type === 'apply' || message.type === 'close') {
        figma.closePlugin()
        if (uiResolve) {
          uiResolve()
          uiResolve = null
        }
      }

      if (message.type === 'resize-ui') {
        const nextWidth = clamp(
          message.width,
          MIN_EDITOR_WIDTH,
          MAX_EDITOR_WIDTH,
        )
        const nextHeight = clamp(
          message.height,
          MIN_EDITOR_HEIGHT,
          MAX_EDITOR_HEIGHT,
        )
        setEditorWidth(nextWidth)
        setEditorHeight(nextHeight)
        figma.ui.resize(nextWidth, nextHeight)
      }
    }
  })

  const openEditor = () =>
    new Promise<void>((resolve) => {
      uiResolve = resolve
      figma.showUI(EDITOR_HTML, {
        width: editorWidth,
        height: editorHeight,
      })
      figma.ui.postMessage({
        type: 'init',
        width,
        height,
        pixels,
        palette: PALETTE,
        activeColor,
        showGrid,
        minSize: MIN_SIZE,
        maxSize: MAX_SIZE,
        cellSize: CELL_SIZE,
        gap: GRID_GAP,
        brushSize,
        minBrushSize: MIN_BRUSH_SIZE,
        maxBrushSize: MAX_BRUSH_SIZE,
        editorWidth,
        editorHeight,
        uiMinWidth: MIN_EDITOR_WIDTH,
        uiMinHeight: MIN_EDITOR_HEIGHT,
        uiMaxWidth: MAX_EDITOR_WIDTH,
        uiMaxHeight: MAX_EDITOR_HEIGHT,
      })
    })

  usePropertyMenu(
    [
      {
        itemType: 'action',
        propertyName: 'editor',
        tooltip: 'Open editor',
      },
      {
        itemType: 'action',
        propertyName: 'grid',
        tooltip: `Grid: ${showGrid ? 'On' : 'Off'}`,
      },
    ],
    ({ propertyName }) => {
      if (propertyName === 'grid') {
        setShowGrid(!showGrid)
        return
      }

      if (propertyName === 'editor') {
        return openEditor()
      }
    },
  )

  return (
    <AutoLayout direction={'vertical'} spacing={0} padding={0} fill={'#FFFFFF'}>
      <SVG src={buildPreviewSvg(width, height, pixels, showGrid)} />
    </AutoLayout>
  )
}

widget.register(Widget)
