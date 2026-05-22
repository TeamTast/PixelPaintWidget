import { paletteEl } from './dom'
import { state } from './state'
import { setActiveColor, updateMode } from './canvas-renderer'

export function renderPalette(): void {
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
}
