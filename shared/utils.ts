export function keyFor(x: number, y: number): string {
  return `${x}:${y}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
