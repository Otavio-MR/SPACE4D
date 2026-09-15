import { describe, expect, it } from 'vitest'

import { bodies, getBody } from '@/content/bodies.ts'
import type { BodyVisual } from '@/content/types.ts'

import { arScale, boundingRadius, cameraDistance } from './framing.ts'

const FOV = 45

/** Meia-altura visível do quadro, a uma dada distância. */
function visibleHalfExtent(distance: number): number {
  return distance * Math.tan((FOV / 2) * (Math.PI / 180))
}

describe('enquadramento dos corpos celestes', () => {
  it('leva os anéis em conta no raio total', () => {
    const saturno = getBody('saturno')!.visual
    const terra = getBody('terra')!.visual

    expect(boundingRadius(saturno)).toBeGreaterThan(boundingRadius(terra) * 2)
  })

  /*
   * Este é o teste que importa: antes da correção a câmera ficava a uma distância
   * fixa, e os anéis de Saturno — mais que o dobro do raio da esfera — apareciam
   * cortados nas laterais.
   */
  it('mantém todo corpo dentro do quadro, anéis inclusive', () => {
    for (const body of bodies) {
      const distance = cameraDistance(body.visual, FOV)
      expect(visibleHalfExtent(distance), body.id).toBeGreaterThanOrEqual(
        boundingRadius(body.visual),
      )
    }
  })

  it('deixa uma margem, sem encostar na borda', () => {
    for (const body of bodies) {
      const ratio =
        boundingRadius(body.visual) / visibleHalfExtent(cameraDistance(body.visual, FOV))
      expect(ratio, body.id).toBeLessThan(0.95)
      // E sem sobrar quadro demais: o corpo precisa preencher a vista.
      expect(ratio, body.id).toBeGreaterThan(0.75)
    }
  })

  it('em AR, mantém todo corpo dentro da largura da carta', () => {
    for (const body of bodies) {
      // 1 unidade = largura da carta; metade dela é o limite de cada lado.
      const halfExtent = arScale(body.visual) * boundingRadius(body.visual)
      expect(halfExtent, body.id).toBeLessThanOrEqual(0.5)
      // E nem tão pequeno que o modelo se perca sobre a carta.
      expect(halfExtent, body.id).toBeGreaterThan(0.15)
    }
  })

  it('em AR, preserva a diferença de tamanho entre os corpos', () => {
    const lua = getBody('lua')!.visual
    const jupiter = getBody('jupiter')!.visual

    const extent = (visual: BodyVisual) => arScale(visual) * boundingRadius(visual)
    expect(extent(jupiter)).toBeGreaterThan(extent(lua))
  })
})
