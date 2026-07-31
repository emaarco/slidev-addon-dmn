import { describe, it, expect, vi } from 'vitest'
import { fitDiagram } from '../../shared/lib/fitDiagram'

/** Build a canvas stub: `viewbox()` reads `view`, `viewbox(obj)` records a set. */
function makeCanvas(view: unknown) {
  const setCalls: any[] = []
  const canvas = {
    setCalls,
    viewbox: vi.fn((arg?: any) => {
      if (arg === undefined) return view
      setCalls.push(arg)
      return undefined
    }),
  }
  return canvas
}

describe('fitDiagram', () => {
  it('does nothing when the inner or outer box is missing or empty', () => {
    for (const view of [
      {},
      { inner: { x: 0, y: 0, width: 0, height: 10 }, outer: { width: 100, height: 100 } },
      { inner: { x: 0, y: 0, width: 10, height: 10 }, outer: { width: 0, height: 100 } },
    ]) {
      const canvas = makeCanvas(view)
      fitDiagram(canvas)
      expect(canvas.setCalls).toHaveLength(0)
    }
  })

  it('clamps at native size and centres when fitting would enlarge the diagram', () => {
    // Small diagram (100×100) in a large canvas (1000×1000) → would scale up, so clamp.
    const canvas = makeCanvas({
      inner: { x: 0, y: 0, width: 100, height: 100 },
      outer: { width: 1000, height: 1000 },
    })
    fitDiagram(canvas)
    // Centre of inner is (50,50); at MAX_SCALE=1 the box is the outer size, centred.
    expect(canvas.setCalls[0]).toEqual({ x: -450, y: -450, width: 1000, height: 1000 })
  })

  it('expands the slacker axis to match the canvas aspect ratio', () => {
    // Wide diagram (2000×1000) in a square canvas → shrink (no clamp) + widen box height.
    const canvas = makeCanvas({
      inner: { x: 0, y: 0, width: 2000, height: 1000 },
      outer: { width: 1000, height: 1000 },
    })
    fitDiagram(canvas)
    // pad = 2000*0.05 = 100 → box 2200×1200 at (-100,-100); height grows to 2200,
    // re-centred: y -= (2200-1200)/2 = 500.
    expect(canvas.setCalls[0]).toEqual({ x: -100, y: -600, width: 2200, height: 2200 })
  })
})
