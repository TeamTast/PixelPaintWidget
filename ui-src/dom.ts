export const canvas = document.getElementById('canvas') as HTMLCanvasElement
export const canvasWrap = document.getElementById(
  'canvasWrap',
) as HTMLDivElement
export const context = canvas.getContext('2d') as CanvasRenderingContext2D
export const paletteEl = document.getElementById('palette') as HTMLDivElement
export const widthInput = document.getElementById(
  'widthInput',
) as HTMLInputElement
export const heightInput = document.getElementById(
  'heightInput',
) as HTMLInputElement
export const brushSizeInput = document.getElementById(
  'brushSize',
) as HTMLInputElement
export const uiWidthInput = document.getElementById(
  'uiWidth',
) as HTMLInputElement
export const uiHeightInput = document.getElementById(
  'uiHeight',
) as HTMLInputElement
export const paintBtn = document.getElementById('paintBtn') as HTMLButtonElement
export const eraseBtn = document.getElementById('eraseBtn') as HTMLButtonElement
export const gridBtn = document.getElementById('gridBtn') as HTMLButtonElement
export const applySizeBtn = document.getElementById(
  'applySize',
) as HTMLButtonElement
export const applyWindowBtn = document.getElementById(
  'applyWindow',
) as HTMLButtonElement
export const applyBtn = document.getElementById('applyBtn') as HTMLButtonElement
