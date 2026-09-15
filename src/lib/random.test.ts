import { describe, expect, it } from 'vitest'

import { createRandom } from './random.ts'

describe('createRandom', () => {
  it('produz a mesma sequência para a mesma semente', () => {
    const a = createRandom(42)
    const b = createRandom(42)
    const first = Array.from({ length: 12 }, () => a())
    const second = Array.from({ length: 12 }, () => b())

    expect(first).toEqual(second)
  })

  it('produz sequências diferentes para sementes diferentes', () => {
    const a = createRandom(1)
    const b = createRandom(2)
    expect(a()).not.toBe(b())
  })

  it('devolve valores no intervalo [0, 1)', () => {
    const random = createRandom(7)
    for (let i = 0; i < 2000; i++) {
      const value = random()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('distribui razoavelmente os valores', () => {
    const random = createRandom(123)
    const samples = Array.from({ length: 5000 }, () => random())
    const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length
    expect(mean).toBeGreaterThan(0.45)
    expect(mean).toBeLessThan(0.55)
  })
})
