const { widget } = figma
const { useSyncedState, usePropertyMenu, useEffect, AutoLayout, Text, SVG } = widget

type PixelMap = Record<string, string>

const MIN_SIZE = 4
const MAX_SIZE = 96
const DEFAULT_WIDTH = 24
const DEFAULT_HEIGHT = 18
const CELL_SIZE = 16
const GRID_GAP = 0
const EDITOR_WIDTH = 900
const EDITOR_HEIGHT = 700
const MIN_EDITOR_WIDTH = 520
const MIN_EDITOR_HEIGHT = 420
const MAX_EDITOR_WIDTH = 1600
const MAX_EDITOR_HEIGHT = 1200
const DEFAULT_BRUSH_SIZE = 1
const MIN_BRUSH_SIZE = 1
const MAX_BRUSH_SIZE = 8

const PALETTE = [
  { name: 'Ground', color: '#6B4F2A' },
  { name: 'Grass', color: '#4A8B2C' },
  { name: 'Water', color: '#2B6CB0' },
  { name: 'Stone', color: '#6C757D' },
  { name: 'Sand', color: '#D4A373' },
  { name: 'Void', color: '#0F172A' },
]

const EDITOR_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      :root {
        --panel-bg: #ffffff;
        --panel-border: #e5e7eb;
        --text: #111827;
        --muted: #6b7280;
        --accent: #111827;
        --accent-text: #ffffff;
        --surface: #f9fafb;
      }

      * {
        box-sizing: border-box;
        font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      }

      html, body {
        height: 100%;
        overflow: hidden;
      }

      body {
        margin: 0;
        background: var(--surface);
        color: var(--text);
        display: flex;
        flex-direction: column;
      }

      header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--panel-border);
        background: var(--panel-bg);
      }

      h1 {
        margin: 0 0 6px;
        font-size: 16px;
      }

      p {
        margin: 0;
        font-size: 12px;
        color: var(--muted);
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        padding: 12px 20px;
        border-bottom: 1px solid var(--panel-border);
        background: var(--panel-bg);
      }

      .group {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .label {
        font-size: 12px;
      }

      button {
        border: 1px solid var(--accent);
        background: var(--panel-bg);
        color: var(--accent);
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 12px;
        cursor: pointer;
      }

      button.active {
        background: var(--accent);
        color: var(--accent-text);
      }

      input[type="number"] {
        width: 70px;
        padding: 6px 8px;
        border: 1px solid var(--panel-border);
        border-radius: 6px;
        font-size: 12px;
      }

      .palette {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .swatch {
        display: grid;
        gap: 4px;
        padding: 6px;
        border-radius: 6px;
        border: 1px solid var(--panel-border);
        cursor: pointer;
        background: #ffffff;
        font-size: 10px;
        text-align: center;
      }

      .swatch.active {
        border-color: var(--accent);
        background: #f8fafc;
      }

      .swatch-color {
        width: 18px;
        height: 18px;
        border-radius: 4px;
      }

      .canvas-wrap {
        flex: 1;
        padding: 16px 20px;
        overflow: auto;
      }

      canvas {
        display: block;
        border: 1px solid var(--panel-border);
        background: #f3f4f6;
        cursor: crosshair;
      }

      .toolbar .group.apply {
        margin-left: auto;
      }
    </style>
  </head>
  <body>
    
      <div class="toolbar">
        <div class="group" id="modeGroup">
          <span class="label">Mode</span>
          <button id="paintBtn" class="active">Paint</button>
          <button id="eraseBtn">Erase</button>
        </div>
        <div class="group">
          <span class="label">Brush</span>
          <input id="brushSize" type="number" min="1" />
        </div>
        <div class="group">
          <span class="label">Window</span>
          <input id="uiWidth" type="number" min="1" />
          <input id="uiHeight" type="number" min="1" />
          <button id="applyWindow">Resize UI</button>
        </div>
        <div class="group">
          <span class="label">Grid</span>
          <button id="gridBtn">On</button>
        </div>
        <div class="group">
          <span class="label">Size</span>
          <input id="widthInput" type="number" min="1" />
          <input id="heightInput" type="number" min="1" />
          <button id="applySize">Resize</button>
        </div>
        <div class="group">
          <span class="label">Palette</span>
          <div class="palette" id="palette"></div>
        </div>
        <div class="group apply">
          <button id="applyBtn" class="active">Apply to Widget</button>
        </div>
      </div>
      <div class="canvas-wrap" id="canvasWrap">
      <canvas id="canvas"></canvas>
    

    <script>
      const state = {
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
        history: [],
        redoStack: [],
        maxHistory: 50,
      }

      const canvas = document.getElementById('canvas')
      const canvasWrap = document.getElementById('canvasWrap')
      const context = canvas.getContext('2d')
      const paletteEl = document.getElementById('palette')
      const widthInput = document.getElementById('widthInput')
      const heightInput = document.getElementById('heightInput')
      const brushSizeInput = document.getElementById('brushSize')
      const uiWidthInput = document.getElementById('uiWidth')
      const uiHeightInput = document.getElementById('uiHeight')
      const paintBtn = document.getElementById('paintBtn')
      const eraseBtn = document.getElementById('eraseBtn')
      const gridBtn = document.getElementById('gridBtn')

      function keyFor(x, y) {
        return x + ':' + y
      }

      function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max)
      }

      function updateMode(nextMode) {
        state.mode = nextMode
        paintBtn.classList.toggle('active', nextMode === 'paint')
        eraseBtn.classList.toggle('active', nextMode === 'erase')
      }

      function updateCursor() {
        const size = state.brushSize * state.cellSize * state.zoom
        const radius = Math.max(2, Math.floor(size / 2))
        const cursorSize = radius * 2 + 2
        const center = cursorSize / 2
        const svg =
          '<svg xmlns="http://www.w3.org/2000/svg" width="' +
          cursorSize +
          '" height="' +
          cursorSize +
          '" viewBox="0 0 ' +
          cursorSize +
          ' ' +
          cursorSize +
          '">' +
          '<circle cx="' +
          center +
          '" cy="' +
          center +
          '" r="' +
          radius +
          '" fill="none" stroke="#111827" stroke-width="1" />' +
          '<circle cx="' +
          center +
          '" cy="' +
          center +
          '" r="1" fill="#111827" />' +
          '</svg>'
        const encoded = encodeURIComponent(svg)
        canvas.style.cursor =
          'url("data:image/svg+xml;utf8,' +
          encoded +
          '") ' +
          center +
          ' ' +
          center +
          ', crosshair'
      }

      function applyZoom(nextZoom, focusX, focusY) {
        const clamped = clamp(nextZoom, state.minZoom, state.maxZoom)
        if (clamped === state.zoom) {
          return
        }

        const prevZoom = state.zoom
        state.zoom = clamped
        canvas.style.transformOrigin = '0 0'
        canvas.style.transform = 'scale(' + state.zoom + ')'

        const rect = canvasWrap.getBoundingClientRect()
        const offsetX = focusX - rect.left
        const offsetY = focusY - rect.top
        const scrollX = canvasWrap.scrollLeft + offsetX
        const scrollY = canvasWrap.scrollTop + offsetY
        const ratio = state.zoom / prevZoom

        canvasWrap.scrollLeft = scrollX * ratio - offsetX
        canvasWrap.scrollTop = scrollY * ratio - offsetY
      }

      function updateGridButton() {
        gridBtn.textContent = state.showGrid ? 'On' : 'Off'
      }

      function setActiveColor(color) {
        state.activeColor = color
        const swatches = paletteEl.querySelectorAll('.swatch')
        swatches.forEach((swatch) => {
          swatch.classList.toggle('active', swatch.dataset.color === color)
        })
      }

      function saveHistory() {
        state.history.push(Object.assign({}, state.pixels))
        if (state.history.length > state.maxHistory) {
          state.history.shift()
        }
        state.redoStack = []
      }

      function undo() {
        if (state.history.length === 0) return
        state.redoStack.push(Object.assign({}, state.pixels))
        state.pixels = state.history.pop()
        drawAll()
      }

      function redo() {
        if (state.redoStack.length === 0) return
        state.history.push(Object.assign({}, state.pixels))
        state.pixels = state.redoStack.pop()
        drawAll()
      }

      function resizeCanvas() {
        const size = state.cellSize
        const gap = state.gap
        canvas.width = state.width * (size + gap) - gap
        canvas.height = state.height * (size + gap) - gap
        canvas.style.width = canvas.width + 'px'
        canvas.style.height = canvas.height + 'px'
        canvas.style.transformOrigin = '0 0'
        canvas.style.transform = 'scale(' + state.zoom + ')'
        drawAll()
      }

      function drawCell(x, y) {
        const key = keyFor(x, y)
        const color = state.pixels[key] || '#F3F4F6'
        const size = state.cellSize
        const gap = state.gap
        const px = x * (size + gap)
        const py = y * (size + gap)
        context.fillStyle = color
        context.fillRect(px, py, size, size)
        if (state.showGrid) {
          context.strokeStyle = '#E5E7EB'
          context.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1)
        }
      }

      function drawAll() {
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

      function paintAt(x, y) {
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

      function paintLine(x0, y0, x1, y1) {
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

      function paintAtEvent(event) {
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

      function pickAtEvent(event) {
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

      document.getElementById('applySize').addEventListener('click', () => {
        const nextWidth = clamp(Number(widthInput.value), state.minSize, state.maxSize)
        const nextHeight = clamp(Number(heightInput.value), state.minSize, state.maxSize)

        const nextPixels = {}
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

      document.getElementById('applyWindow').addEventListener('click', () => {
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
        parent.postMessage(
          {
            pluginMessage: {
              type: 'resize-ui',
              width: nextWidth,
              height: nextHeight,
            },
          },
          '*',
        )
      })

      document.getElementById('applyBtn').addEventListener('click', () => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'apply',
              width: state.width,
              height: state.height,
              pixels: state.pixels,
              activeColor: state.activeColor,
              showGrid: state.showGrid,
              brushSize: state.brushSize,
            },
          },
          '*',
        )
      })

      window.onmessage = (event) => {
        const message = event.data.pluginMessage
        if (!message || message.type !== 'init') {
          return
        }

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

        paletteEl.innerHTML = ''
        state.palette.forEach((swatch) => {
          const item = document.createElement('div')
          item.className = 'swatch'
          item.dataset.color = swatch.color
          const chip = document.createElement('div')
          chip.className = 'swatch-color'
          chip.style.background = swatch.color
          const label = document.createElement('div')
          label.textContent = swatch.name
          item.appendChild(chip)
          item.appendChild(label)
          item.addEventListener('click', () => {
            updateMode('paint')
            setActiveColor(swatch.color)
          })
          paletteEl.appendChild(item)
        })

        setActiveColor(state.activeColor)
        updateGridButton()
        updateCursor()
        resizeCanvas()
      }

      window.addEventListener('keydown', (event) => {
        const mod = event.ctrlKey || event.metaKey
        if (!mod) return
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault()
          undo()
        } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault()
          redo()
        }
      })
    </script>
  </body>
</html>`

let uiResolve: (() => void) | null = null

function keyFor(x: number, y: number) {
  return `${x}:${y}`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function buildPreviewSvg(
  width: number,
  height: number,
  pixels: PixelMap,
  showGrid: boolean,
) {
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
    grid = `<path d="${lines}" stroke="#E5E7EB" stroke-width="1" shape-rendering="crispEdges" />`
  }

  return `<svg width="${pxWidth}" height="${pxHeight}" viewBox="0 0 ${pxWidth} ${pxHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#F3F4F6" />${rects}${grid}</svg>`
}

function Widget() {
  const [width, setWidth] = useSyncedState('width', DEFAULT_WIDTH)
  const [height, setHeight] = useSyncedState('height', DEFAULT_HEIGHT)
  const [pixels, setPixels] = useSyncedState<PixelMap>('pixels', {})
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
    figma.ui.onmessage = (message) => {
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
          setBrushSize(
            clamp(message.brushSize, MIN_BRUSH_SIZE, MAX_BRUSH_SIZE),
          )
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
        const nextWidth = clamp(message.width, MIN_EDITOR_WIDTH, MAX_EDITOR_WIDTH)
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
  }, [])

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
