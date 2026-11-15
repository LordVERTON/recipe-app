import type { OcrLine } from './types'

export const normalizeOverlap = (value: string) => value.toLocaleLowerCase('fr').replace(/œ/g, 'oe')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const next = [i]
    for (let j = 1; j <= b.length; j++) next[j] = Math.min(next[j - 1] + 1, previous[j] + 1, previous[j - 1] + Number(a[i - 1] !== b[j - 1]))
    previous = next
  }
  return previous[b.length]
}
function similarity(a: string, b: string): number {
  const x = normalizeOverlap(a), y = normalizeOverlap(b)
  if (x === y) return 1
  if (x.match(/\d+/g)?.join('|') !== y.match(/\d+/g)?.join('|')) return 0
  if (Math.min(x.length, y.length) < 24 || Math.max(x.length, y.length) > 500 || Math.abs(x.length - y.length) > 2) return 0
  const d = distance(x, y)
  return d <= 2 ? 1 - d / Math.max(x.length, y.length) : 0
}
/** Only suffix/prefix overlaps of adjacent pages, never global deduplication. */
export function mergeOcrPages(pages: readonly (readonly string[])[]) {
  const lines: string[] = []
  const overlaps: { pageIndex: number; removed: number }[] = []
  let previous: readonly string[] = []
  pages.forEach((raw, pageIndex) => {
    const page = raw.filter(line => line.trim())
    let overlap = 0
    for (let count = Math.min(previous.length, page.length, 60); count >= 1; count--) {
      const suffix = previous.slice(-count)
      const scores = suffix.map((line, i) => similarity(line, page[i]))
      const enoughText = suffix.map(normalizeOverlap).join('').length >= (count === 1 ? 20 : 16)
      if (enoughText && scores.every(score => score >= 0.94) && (count > 1 || scores[0] === 1)) { overlap = count; break }
    }
    lines.push(...page.slice(overlap))
    if (overlap) overlaps.push({ pageIndex, removed: overlap })
    previous = page
  })
  return { text: lines.join('\n'), overlaps }
}
/** Row clustering then left-to-right, for single-column documents. */
export function orderOcrLines(items: Omit<OcrLine, 'order'>[]): OcrLine[] {
  const box = (line: Omit<OcrLine, 'order'>) => ({
    x: Math.min(...line.poly.map(p => p[0])), y: Math.min(...line.poly.map(p => p[1])),
    height: Math.max(...line.poly.map(p => p[1])) - Math.min(...line.poly.map(p => p[1])),
  })
  const rows: { y: number; height: number; lines: typeof items }[] = []
  for (const line of [...items].sort((a, b) => box(a).y - box(b).y)) {
    const b = box(line)
    const row = rows.find(r => Math.abs(r.y - b.y) <= Math.min(r.height, b.height) * 0.45)
    if (row) row.lines.push(line)
    else rows.push({ ...b, lines: [line] })
  }
  return rows.flatMap(row => row.lines.sort((a, b) => box(a).x - box(b).x)).map((line, order) => ({ ...line, order }))
}
