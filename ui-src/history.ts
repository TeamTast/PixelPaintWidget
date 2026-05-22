import type { PixelMap } from '../shared/messages'
import { state } from './state'

const MAX_HISTORY = 50

let history: PixelMap[] = []
let redoStack: PixelMap[] = []

export function saveHistory(): void {
  history.push({ ...state.pixels })
  if (history.length > MAX_HISTORY) {
    history.shift()
  }
  redoStack = []
}

export function undo(): void {
  if (history.length === 0) {
    return
  }
  redoStack.push({ ...state.pixels })
  state.pixels = history.pop() ?? {}
}

export function redo(): void {
  if (redoStack.length === 0) {
    return
  }
  history.push({ ...state.pixels })
  state.pixels = redoStack.pop() ?? {}
}

export function clearHistory(): void {
  history = []
  redoStack = []
}
